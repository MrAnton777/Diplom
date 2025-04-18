import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import * as dotenv from 'dotenv';
dotenv.config()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const key = process.env.SECRET
    if (!key){
      throw new Error('Secret key not found')
    }
    super({
      jwtFromRequest: (req) => req.cookies?.jwt,
        secretOrKey:key,
      });
  }

  async validate(payload: any) {
    return this.authService.validateUser(payload);
  }
}