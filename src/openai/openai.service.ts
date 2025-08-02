import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { SYSTEM_PROMPT } from './openai-consts';
import { GptAiQuery, GptAiQuerySchema } from 'src/schemas/gpt-query.schema';
import { GmailService } from 'src/gmail/gmail.service';
import { GoogleService } from 'src/google/google.service';
import { AiSearchResultResponse, AiSearchResults } from './openai.types';
import { UserStateService } from 'src/user-state/user-state.service';
import { createAiServiceMap } from './ai-service-map';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  constructor(
    private readonly configService: ConfigService,
    private readonly gmailService: GmailService,
    private readonly googleService: GoogleService,
    private readonly userStateService: UserStateService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPEN_AI_SECRET_KEY'),
    });
  }

  async convertQuestionToQuery(question: string): Promise<GptAiQuery> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          temperature: 0,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question },
          ],
        });
        const text = completion.choices[0].message.content?.trim();
        console.log('RAW GPT TEXT:', text);

        if (!text) throw new Error('GPT החזיר תגובה ריקה');

        const parsedJson = JSON.parse(text);
        const result = GptAiQuerySchema.safeParse(parsedJson);

        if (!result.success) {
          throw new Error(
            'GPT החזיר מבנה לא חוקי:\n' +
              JSON.stringify(result.error.format(), null, 2),
          );
        }
        return result.data;
      } catch (e) {
        console.log(e.message);
      }
    }
    throw new Error('כל ניסיונות הקריאה ל־OpenAI נכשלו:\n');
  }

  async getAllItems(
    userEmail: string,
    question: string,
  ): Promise<AiSearchResultResponse> {
    const previousQuery = this.userStateService.getQuery(userEmail);

    let parsedQuery: GptAiQuery;

    if (question == previousQuery) {
      parsedQuery = this.userStateService.getParsedQuery(userEmail) ?? {};
    } else {
      parsedQuery = await this.convertQuestionToQuery(question);
      this.userStateService.resetAllPagination(userEmail);
    }

    this.userStateService.setParsedQuery(userEmail, parsedQuery);
    this.userStateService.setQuery(userEmail, question);

    const serviceMap = createAiServiceMap(
      this.gmailService,
      this.googleService,
      userEmail,
      parsedQuery,
    );

    const result: AiSearchResults = {};

    await Promise.allSettled(
      Object.keys(parsedQuery).map(async (provider) => {
        const value = parsedQuery[provider as keyof GptAiQuery];
        const serviceFN = serviceMap[provider];
        if (value && serviceMap[provider]) {
          return serviceFN()
            .then((data) => {
              result[provider] = data;
            })
            .catch((e) => `Error in ${provider} - ${e.message}`);
        }
      }),
    );
    const isNextPageToken = this.userStateService.getIsPagination(userEmail);

    return { result, isNextPageToken };
  }
}
