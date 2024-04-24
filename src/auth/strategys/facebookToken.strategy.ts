import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FacebookTokenStrategy implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const matchesToken = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${request.rawHeaders[3].split(' ')[1]}&access_token=${this.configService.get('APP_ID_FACEBOOK')}|${this.configService.get('APP_SECRET_FACEBOOK')}`,
    );
    return matchesToken.data.data.is_valid;
  }
}
 