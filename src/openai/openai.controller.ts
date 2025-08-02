import { Body, Controller, Post, Req } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { JwtTokenService } from 'src/auth/jwt-token';

@Controller('openai')
export class OpenaiController {
  constructor(
    private readonly openAiService: OpenaiService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  @Post('getAiFiles')
  async getAllFilesAi(@Body() body: { question: string }, @Req() req) {
    try {
      const { question } = body;
      const token = req.cookies?.token;
      const payload = this.jwtTokenService.verifyToken(token);
      const result = await this.openAiService.getAllItems(
        payload.email,
        question,
      );
      return result;
    } catch (e) {
      console.log(e.message);
      throw new Error('Faild to fetch openai ' + e.message);
    }
  }
}
