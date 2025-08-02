import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from './jwt-token';
import { UserStateService } from 'src/user-state/user-state.service';
import { firstValueFrom, retry } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ACCESS_GOOGLE_URL } from './auth.consts';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRes } from './auth.types';
import { email } from 'zod';

// לטפל פה בשגיאות

@Injectable()
export class AuthMiddleWare {
  constructor(
    private jwtAuthService: JwtTokenService,
    private userStateService: UserStateService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}
  async getNewRefreshToken(email: string): Promise<void> {
    try {
      const refreshToken = this.userStateService.getRefreshToken(email);

      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      const googleClientId = await this.configService.get('GOOGLE_CLIENT_ID');
      const client_secret = this.configService.get('GOOGLE_CLIENT_SECRET');
      const response = await firstValueFrom(
        this.httpService
          .post(ACCESS_GOOGLE_URL, {
            client_id: googleClientId,
            client_secret: client_secret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          })
          .pipe(retry(3)),
      );
      const { access_token, expires_in } = response.data;

      this.userStateService.saveAccessTokenByRefresh(
        email,
        access_token,
        expires_in,
      );
    } catch (e) {
      throw new Error('Faild to fetch refresh token');
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) {
      console.log('ERROR - missing token');
    }
    try {
      const payload = this.jwtAuthService.verifyToken(token);
      (req as any).user = { email: payload.email };
      const a = this.userStateService.getAccessByEmail(payload.email);
      console.log(a);
      const expired = this.userStateService.isTokenExpired(payload.email);

      if (expired) {
        try {
          await this.getNewRefreshToken(payload.email);
        } catch (err) {
          console.log('Failed to refresh Google access token', err.message);
          return res
            .status(401)
            .json({ message: 'Google token expired. Please login again.' });
        }
      }

      next();
    } catch (e) {
      try {
        const decoded = this.jwtAuthService.decodeToken(token) as any;
        const userEmail = decoded?.email;
        if (!userEmail) {
          throw new UnauthorizedException('Invalid token payload');
        } else {
          try {
            await this.getNewRefreshToken(userEmail);
            const jwtToken = this.jwtAuthService.generateToken(userEmail);
            res.cookie('token', jwtToken, {
              httpOnly: true,
              secure: false, // בפרודקשן - true עם HTTPS
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 1000,
            });
          } catch (e) {
            console.log(e.message);
          }
          return next();
        }
      } catch (RefreshError) {
        console.log(RefreshError.message);
        return res
          .status(401)
          .json({ message: 'Google token expired. Please login again.' });
      }
    }
  }
}
