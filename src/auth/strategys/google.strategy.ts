import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

config()

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  

  constructor(private readonly configService: ConfigService) {

      super({
        clientID: configService.get('APP_ID_GOOGLE'),
        clientSecret: configService.get('APP_SECRET_GOOGLE'),
        callbackURL: configService.get('API_URL') + '/auth/google/redirect',
        scope: ['email', 'profile'],
      });
    }
  
    async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
      const { name, emails } = profile
      const user = {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        accessToken,
      
      }
      const payload = {
        user,
        accessToken,
      };
      done(null, payload);
    }
  }