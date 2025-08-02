import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';

@Module({})
export class GmailModule {
  providers: [GmailService];
}
