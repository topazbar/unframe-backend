import { GmailMessageMetadata } from 'src/gmail/gmail.types';
import { DriveFile } from 'src/google/google.types';

export interface AiSearchResults {
  gmail?: GmailMessageMetadata[];
  googleDrive?: DriveFile[];
}

export interface AiSearchResultResponse {
  isNextPageToken?: boolean;
  result: AiSearchResults;
}
