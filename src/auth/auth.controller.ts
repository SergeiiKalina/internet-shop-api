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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CustomValidationPipe } from './pipes/registrationValidationPipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('registration')
  async registration(
    @Body(new CustomValidationPipe()) newUser: RegistrationDto,
    @Res() res: Response,
  ) {
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', default: 'setserg02@gmail.com' },
        password: { type: 'string', default: '12345aA!' },
      },
    },
  })
  @Post('login')
  async login(@Body() dto: AuthEmailLoginDto) {
    return this.authService.login(dto);
  }

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
    return res.redirect(process.env.API_URL_GIT);
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
      `${this.configService.get('API_URL_GIT')}?userData=${JSON.stringify(req.user)}`,
    );
    return HttpStatus.OK;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res) {
    res.redirect(
      `${this.configService.get('API_URL_GIT')}?userData=${JSON.stringify(req.user)}`,
    );
    return HttpStatus.OK;
  }

  @Post('forgotPassword')
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPassword: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPassword);
  }

  @Post('changePassword')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    return this.authService.changePassword(changePasswordDto, userId);
  }
}
