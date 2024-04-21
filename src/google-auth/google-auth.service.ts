import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';

config()

@Injectable()
export class GoogleAuthService extends PassportStrategy(Strategy, 'google') {

    constructor() {
      super({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: 'http://localhost:8080/auth/google/login',
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
        refreshToken
      }
      done(null, user);
    }

    async googleLogin(req) {
        if (!req.user) {
          return 'No user from google'
        }
    
        return {
          message: 'User information from google',
          user: req.user
        }
      }
  }