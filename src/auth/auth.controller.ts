import { AuthService } from './auth.service';
import {
  Get,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  Controller,
  Req,
  Param,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RegistrationDto } from './dto/registrationDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: AuthService) {}

  @Get()
  async getAllUsers(@Res() res: Response) {
    res.sendFile('C:/Users/PC/Desktop/internet-shop/src/auth/index.html');
    //;)
  }
  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() newUser: RegistrationDto, @Res() res: Response) {
    try {
      const user = await this.usersService.registration(newUser);
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

  @Get('refresh')
  async refreshJwt(@Req() req: Request, @Res() res: Response) {
    const refreshJwt = req.cookies.refreshToken;

    const userData = await this.usersService.refreshJwt(refreshJwt);
    res.cookie('refreshToken', userData.refreshJwt, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.json(userData);
  }

  @Get('activate/:link')
  async activate(@Param() param: { link: string }, @Res() res: Response) {
    const link = param.link;

    await this.usersService.activate(link);
    return res.redirect(process.env.API_URL);
  }
}
