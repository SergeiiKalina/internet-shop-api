import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FacebookTokenStrategy implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.rawHeaders[11].split(' ')[1];
    const matchesToken = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${this.configService.get('APP_ID_FACEBOOK')}|${this.configService.get('APP_SECRET_FACEBOOK')}`,
    );
    if (matchesToken.data.data.is_valid) {
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
      );
      const userData = response.data;
      request.user = userData;
      return userData;
    }

    return null;
  }
}
