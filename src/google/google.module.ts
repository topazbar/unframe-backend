import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';

@Module({})
export class GoogleModule {
  providers: [GoogleService];
}
