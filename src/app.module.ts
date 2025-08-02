import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleModule } from './google/google.module';
import { AuthGoogleService } from './auth/auth-google.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { GoogleService } from './google/google.service';
import { JwtTokenService } from './auth/jwt-token';
import { JwtModule } from '@nestjs/jwt';
import { GmailService } from './gmail/gmail.service';
import { GmailModule } from './gmail/gmail.module';
import { AuthTrelloService } from './auth/auth-trello.service';
import { OpenaiService } from './openai/openai.service';
import { OpenaiController } from './openai/openai.controller';
import { UserStateService } from './user-state/user-state.service';
import { AuthMiddleWare } from './auth/auth.middleware';
import { UserStateModule } from './user-state/user-state.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      global: true,
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserStateModule,
    GoogleModule,
    AuthModule,
    GmailModule,
  ],
  controllers: [AppController, AuthController, OpenaiController],
  providers: [
    AppService,
    UserStateService,
    AuthGoogleService,
    GoogleService,
    JwtTokenService,
    GmailService,
    AuthTrelloService,
    OpenaiService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleWare)
      .forRoutes({ path: 'openai/getAiFiles', method: RequestMethod.POST });
  }
}
// export class AppModule {}
