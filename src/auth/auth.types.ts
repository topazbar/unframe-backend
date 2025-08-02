export interface OAuthTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  fetchedAt: number;
  scope: string;
  token_type: string;
  id_token?: string;
  refresh_token_expires_in?: number;
}

export interface RefreshTokenRes {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface JwtPayload {
  email: string;
  role: string;
  iat: number;
  exp: number;
}
