import { GmailService } from 'src/gmail/gmail.service';
import { GoogleService } from 'src/google/google.service';
import { GptAiQuery } from 'src/schemas/gpt-query.schema';

export function createAiServiceMap(
  gmailService: GmailService,
  googleService: GoogleService,
  userEmail: string,
  parsedQuery: GptAiQuery,
) {
  return {
    gmail: () => gmailService.getMessages(userEmail, parsedQuery.gmail || {}),
    googleDrive: () =>
      googleService.searchFilesByAiQuery(
        userEmail,
        parsedQuery.googleDrive || {},
      ),
  };
}
