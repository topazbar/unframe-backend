import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.types';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}
  generateToken(email: string): string {
    return this.jwtService.sign({ email }, { expiresIn: '1h' });
  }
  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
  decodeToken(token: string): JwtPayload {
    return this.jwtService.decode(token);
  }
}
