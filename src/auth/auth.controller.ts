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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RegistrationDto } from './dto/registrationDto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { FacebookTokenStrategy } from './strategys/facebookToken.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  @ApiOperation({
    summary: 'Login as a user',
  })
  @Post('login')
  async login(@Body() dto: AuthEmailLoginDto) {
    return this.authService.login(dto);
  }

  //   try {
  //     res.clearCookie('jwt');
  //     return { message: 'Logout successful' };
  // } catch (error) {

  //     return { error: 'Logout failed', message: error.message };
  // }

  @ApiBearerAuth()
  @Get('logout')
  @ApiOperation({ summary: 'logout by user' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    req.logout;
  }

  @Get('refresh')
  async refreshJwt(@Req() req: Request, @Res() res: Response) {
    const refreshJwt = req.cookies.refreshToken;

    const userData = await this.authService.refreshJwt(refreshJwt);
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

    await this.authService.activate(link);
    return res.redirect(process.env.API_URL);
  }
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req: Request, @Res() res): Promise<any> {
    res.redirect(
      `http://localhost:3000/marketplace/?userData=${JSON.stringify(req.user)}`,
    );
    return HttpStatus.OK;
  }
}
