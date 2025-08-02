import { GptAiQuery } from 'src/schemas/gpt-query.schema';

export interface Id {
  id: string;
  threadId: string;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailPayloadMetadata {
  headers: GmailHeader[];
}

export interface GmailMessageMetadata {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  sizeEstimate?: number;
}

export interface GmailResponse {
  messages: GmailMessageMetadata[];
  nextPageToken?: string;
}

export interface GmailMessagesListResponse {
  messages?: Id[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export type GmailQuery = NonNullable<GptAiQuery['gmail']>;
