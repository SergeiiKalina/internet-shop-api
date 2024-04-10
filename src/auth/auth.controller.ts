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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RegistrationDto } from './dto/registrationDto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  @ApiOperation({
    summary: 'Login as a user',
  })

  @Post('/login')
  async login(@Body() dto: AuthEmailLoginDto) { 
    return this.authService.login(dto); 
  }


  
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Post('logout')
async logout(@Res() res: Response) {
  try {
      res.clearCookie('jwt');
      return { message: 'Logout successful' };
  } catch (error) {
    
      return { error: 'Logout failed', message: error.message };
  }
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
}

