import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { JwtTokenService } from './jwt-token';
import { AuthTrelloService } from './auth-trello.service';
import { Response } from 'express';
import { JwtPayload } from './auth.types';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthGoogleService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly authTrelloService: AuthTrelloService,
    private readonly configService: ConfigService,
  ) {}

  @Get('googleGenerateUrlAuth')
  generateUrl(): string {
    return this.authService.generateUrl();
  }

  @Get('google/redirect')
  async createJwtToken(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwt = await this.authService.createAccsessKey(code);
    res.cookie('token', jwt, {
      httpOnly: true,
      secure: false, // בפרודקשן - true עם HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });
    const redirect_url_ui = this.configService.get('REDIRECT_URL_UI');
    return res.redirect(redirect_url_ui);
  }
  @Get('validToken')
  verifyToken(@Req() req): JwtPayload {
    const token = req.cookies?.token;
    if (!token) {
      throw new Error('Missing token');
    }
    const response = this.jwtTokenService.verifyToken(token);
    return response;
  }

  @Get('trello')
  generateUrlToTrello(): string {
    const url = this.authTrelloService.generateTrelloUrl();
    return url;
  }

  //continue
  @Get('trello/redirect')
  redirect() {}
}
