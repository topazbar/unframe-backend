import { Injectable } from '@nestjs/common';
import { UserState } from './user-state.types';
import { OAuthTokenData } from 'src/auth/auth.types';
import { GptAiQuery } from 'src/schemas/gpt-query.schema';

@Injectable()
export class UserStateService {
  private userTokens: Record<string, UserState> = {};

  getParsedQuery(email: string) {
    return this.userTokens[email].parsedQuery;
  }

  getExpiresTimeToken(email: string) {
    return this.userTokens[email]?.token.expires_in;
  }

  getIsPagination(email: string) {
    return this.userTokens[email].isPagination;
  }

  getPaginationByProvider(email: string, provider: string) {
    return this.userTokens[email][provider]?.paginationNextPageToken;
  }
  setPaginationByProvider(
    email: string,
    provider: string,
    paginationNextPageToken: string,
  ) {
    this.userTokens[email]['isPagination'] = true;
    return (this.userTokens[email][provider]['paginationNextPageToken'] =
      paginationNextPageToken);
  }

  resetAllPagination(email: string) {
    const state = this.userTokens[email];
    if (!state) return;
    const allkeys = Object.keys(state);
    for (const key in allkeys) {
      if (state[key]?.paginationNextPageToken) {
        state[key].paginationNextPageToken = undefined;
      }
    }
    this.userTokens[email].isPagination = false;
  }
  saveTokensByEmail(email: string, tokens: OAuthTokenData) {
    const current = this.userTokens[email] || {};
    const fetchedAt = Date.now();
    this.userTokens[email] = {
      ...current,
      token: {
        ...tokens,
        fetchedAt,
      },
    };
  }
  saveAccessTokenByRefresh(
    email: string,
    access_token: string,
    expires_in: number,
  ) {
    const fetchedAt = Date.now();
    this.userTokens[email]['token']['access_token'] = access_token;
    this.userTokens[email]['token']['expires_in'] = expires_in;
    this.userTokens[email]['token']['fetchedAt'] = fetchedAt;
  }

  isTokenExpired(email: string): boolean {
    const token = this.userTokens[email]?.token;
    console.log(token);
    if (!token?.fetchedAt || !token?.expires_in) {
      return true;
    }

    const expiresAt = token.fetchedAt + token.expires_in * 1000;
    console.log(expiresAt, token.fetchedAt);
    return Date.now() > expiresAt;
  }

  getQuery(email: string): string | undefined {
    if (this.userTokens[email].query) {
      return this.userTokens[email].query;
    } else {
      return '';
    }
  }
  setQuery(email: string, query: string) {
    this.userTokens[email]['query'] = query;
  }
  setParsedQuery(email: string, query: GptAiQuery) {
    this.userTokens[email]['parsedQuery'] = query;
  }

  getAccessByEmail(email: string) {
    return this.userTokens[email].token.access_token;
  }
  getRefreshToken(email: string) {
    return this.userTokens[email].token.refresh_token;
  }
}
