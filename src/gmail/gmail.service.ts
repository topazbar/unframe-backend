import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { GMAIL_URL_GET_MESSAGES, LIMIT_RESULT } from './gmail-consts';
import { firstValueFrom, lastValueFrom, retry } from 'rxjs';
import {
  GmailMessageMetadata,
  GmailMessagesListResponse,
  GmailQuery,
  Id,
} from './gmail.types';
import { UserStateService } from 'src/user-state/user-state.service';
import { buildGmailQuery } from './gmail-utils';

@Injectable()
export class GmailService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userStateService: UserStateService,
  ) {}

  extractGmailMetadata(headers: { name: string; value: string }[]) {
    const map = Object.fromEntries(
      headers.map((h) => [h.name.toLowerCase(), h.value]),
    );

    return {
      subject: map['subject'] ?? '',
      from: map['from'] ?? '',
      date: map['date'] ?? '',
    };
  }
  private async fetchMessageIds(
    accessToken: string,
    query?: string,
    pageToken?: string,
    headers?: string[],
    limitFilter?: number,
  ): Promise<GmailMessagesListResponse> {
    try {
      const result = await firstValueFrom(
        this.httpService
          .get(GMAIL_URL_GET_MESSAGES, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              maxResults: limitFilter ?? LIMIT_RESULT,
              pageToken,
              q: query,
              format: 'metadata',
              metadataHeaders: headers ?? ['Subject', 'From', 'Date'],
            },
          })
          .pipe(retry(3)),
      );

      return result.data;
    } catch (e) {
      throw new Error('Faild To Fetch Ids ' + e.message);
    }
  }
  private async fetchMessagesByIds(
    ids: Id[],
    accessToken: string,
    headers?: string[],
  ): Promise<GmailMessageMetadata[]> {
    try {
      //FIX TO allSettled
      const responses = await Promise.all(
        ids.map((message) =>
          lastValueFrom(
            this.httpService
              .get(`${GMAIL_URL_GET_MESSAGES}/${message.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                  format: 'metadata',
                  metadataHeaders: headers ?? ['Subject', 'From', 'Date'],
                },
              })
              .pipe(retry(3)),
          ),
        ),
      );

      return responses.map((res) => {
        const { subject, from, date } = this.extractGmailMetadata(
          res.data.payload?.headers ?? [],
        );
        return {
          id: res.data.id,
          threadId: res.data.threadId,
          snippet: res.data.snippet,
          subject,
          from,
          date,
        };
      });
    } catch (e) {
      throw new Error('Faild To Fetch Message Data ' + e.message);
    }
  }

  async getMessages(
    userEmail: string,
    query: GmailQuery,
  ): Promise<GmailMessageMetadata[]> {
    try {
      const accessToken = this.userStateService.getAccessByEmail(userEmail);

      if (
        Object.keys(query?.filters ?? {}).length === 0 &&
        Object.keys(query?.headers ?? {}).length === 0
      ) {
        return [];
      }

      const headers = query?.headers?.length
        ? query.headers
        : ['Subject', 'From', 'Date'];

      const queryString = query?.filters
        ? buildGmailQuery(query.filters)
        : undefined;

      const pageToken =
        this.userStateService.getPaginationByProvider(userEmail, 'gmail') ??
        undefined;

      const limitFilter = Math.min(
        query?.filters?.maxResults ?? LIMIT_RESULT,
        LIMIT_RESULT,
      );

      const idsData = await this.fetchMessageIds(
        accessToken,
        queryString,
        pageToken,
        headers,
        limitFilter,
      );

      const userLimit = query?.filters?.maxResults;

      const hasMoreResult =
        userLimit !== undefined && (idsData.messages?.length ?? 0) < userLimit;

      if (hasMoreResult && idsData?.nextPageToken) {
        this.userStateService.setPaginationByProvider(
          userEmail,
          'gmail',
          idsData.nextPageToken,
        );
      }

      if (!idsData.messages?.length) return [];
      const contentMessages = await this.fetchMessagesByIds(
        idsData.messages,
        accessToken,
        headers,
      );

      return contentMessages;
    } catch (e) {
      console.log(e.message);
      throw new Error('Faild tofetch gmail ' + e.message);
    }
  }
}
