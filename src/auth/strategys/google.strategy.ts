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
      clientID: process.env.APP_ID_GOOGLE,
      clientSecret: process.env.APP_SECRET_GOOGLE,
      callbackURL: 'https://internet-shop-api.onrender.com/auth/google/redirect',
      scope: 'email',
      // profileFields: ['emails', 'name'],
    });
  }

 async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };

    const payload = {
      user,
    };

    done(null, payload);
  }
}