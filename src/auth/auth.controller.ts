import { Controller, HttpCode, HttpStatus, Param, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, Post, Body, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { RegistrationDto } from './dto/registrationDto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() newUser: RegistrationDto, @Res() res: Response) {
    try {
      const user = await this.authService.registration(newUser);
      res.cookie('refreshToken', user.refreshJwt, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Req() req) {
      return req.user;
    }
}
