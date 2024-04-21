import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {GoogleAuthService} from './google-auth.service'
import { ApiTags } from '@nestjs/swagger';



@ApiTags('auth')
@Controller('google-auth')
export class GoogleAuthController {
    constructor(private readonly GoogleAuthService: GoogleAuthService) {}

    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {}
  
    @Post('redirect')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req) {
      return this.GoogleAuthService.googleLogin(req)
    }
}
