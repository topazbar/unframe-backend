import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGoogleService } from './auth-google.service';
import { JwtTokenService } from './jwt-token';
import { AuthTrelloService } from './auth-trello.service';
import { UserStateModule } from 'src/user-state/user-state.module';

@Module({
  controllers: [AuthController],
  imports: [UserStateModule],
  providers: [AuthGoogleService, JwtTokenService, AuthTrelloService],
})
export class AuthModule {}
