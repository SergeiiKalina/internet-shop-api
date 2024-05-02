import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('APP_ID_FACEBOOK'),
      clientSecret: configService.get('APP_SECRET_FACEBOOK'),
      callbackURL: configService.get('API_URL') + '/auth/facebook/redirect',
      scope: 'email',
      profileFields: ['emails', 'name', 'picture', 'displayName'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { emails, displayName } = profile;

    const user = {
      email: emails[0].value,
      name: displayName,
    };
    const payload = {
      user,
      accessToken,
    };

    done(null, payload);
  }
}
