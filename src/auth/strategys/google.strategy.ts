import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';

config()

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  

  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('APP_ID_GOOGLE'),
      clientSecret: configService.get('APP_SECRET_GOOGLE'),
      callbackURL: configService.get('API_URL') + '/auth/google/redirect',
      scope: ['profile', 'email'],
      });
  }

 async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
    };

    const payload = {
      user,
      accessToken
    };

    done(null, payload);
  }
}