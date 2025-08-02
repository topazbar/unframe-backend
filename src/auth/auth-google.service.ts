import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, retry } from 'rxjs';
import {
  ACCESS_GOOGLE_URL,
  AUTH_GOOGLE_URL,
  INFO_GOOGLE_URL,
} from './auth.consts';
import { JwtTokenService } from './jwt-token';
import { OAuthTokenData } from './auth.types';
import { UserStateService } from 'src/user-state/user-state.service';

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly userStateService: UserStateService,
  ) {}

  saveTokensForUser(email: string, tokens: OAuthTokenData): string {
    if (email) {
      const jwt = this.jwtTokenService.generateToken(email);
      this.userStateService.saveTokensByEmail(email, tokens);
      console.log(`Saved tokens for ${email}`);
      return jwt;
    } else {
      throw new Error('email not valid for create token');
    }
  }

  async getUserInfo(accessToken: string): Promise<string> {
    try {
      const result = await firstValueFrom(
        this.httpService
          .get(INFO_GOOGLE_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          .pipe(retry(3)),
      );
      const email = result.data.email;
      return email;
    } catch (e) {
      throw new Error('Faild to get email ' + e.message);
    }
  }

  generateUrl(): string {
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const redirect_url = this.configService.get('GOOGLE_REDIRECT_URI');
    const scope = this.configService.get('SCOPE');
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirect_url,
      response_type: 'code',
      scope: scope.replace(/,/g, ' '),
      access_type: 'offline',
      prompt: 'consent',
    });
    const url = `${AUTH_GOOGLE_URL}?${params.toString()}`;
    return url;
  }

  async createAccsessKey(code: string): Promise<string> {
    try {
      const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
      const redirect_url = this.configService.get('GOOGLE_REDIRECT_URI');
      const client_secret = this.configService.get('GOOGLE_CLIENT_SECRET');
      const payload = new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: client_secret,
        redirect_uri: redirect_url,
        grant_type: 'authorization_code',
      });
      const result = await firstValueFrom(
        this.httpService
          .post(ACCESS_GOOGLE_URL, payload.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .pipe(retry(3)),
      );
      const accessToken: string = result.data.access_token;
      const email = await this.getUserInfo(accessToken);
      const jwtToken = this.saveTokensForUser(email, result.data);
      return jwtToken;
    } catch (e) {
      console.log(e.message);
      throw new Error('Google auth failed');
    }
  }
}
