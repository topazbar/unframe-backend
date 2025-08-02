import { Injectable } from '@nestjs/common';
import { TRELLO_AUTH_URL } from './auth.consts';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthTrelloService {
  constructor(private configService: ConfigService) {}
  generateTrelloUrl(): string {
    const app = this.configService.get('TRELLO_APP_NAME');
    const returnUrl = this.configService.get('TRELLO_REDIRECT_URL');
    const apiKey = this.configService.get('TRELLO_API_KEY');
    const params = new URLSearchParams({
      expiration: 'never',
      appName: app,
      scope: 'read,write',
      response_type: 'token',
      key: apiKey,
      return_url: returnUrl,
    });

    return `${TRELLO_AUTH_URL}?${params.toString()}`;
  }
}
