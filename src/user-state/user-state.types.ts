import { OAuthTokenData } from 'src/auth/auth.types';
import { GptAiQuery } from 'src/schemas/gpt-query.schema';

export interface UserState {
  query?: string;
  token: OAuthTokenData;
  googleDrive?: {
    paginationNextPageToken?: string;
  };
  gmail?: {
    paginationNextPageToken?: string;
  };
  parsedQuery?: GptAiQuery;
  isPagination?: boolean;
}
