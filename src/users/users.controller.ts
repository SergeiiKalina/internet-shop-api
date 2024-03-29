import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Get, Post, Body, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { RegistrationDto } from './dto/registrationDto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  @Post('registration')
  @UsePipes(new ValidationPipe())
  async registration(@Body() newUser: RegistrationDto, @Res() res: Response) {
    try {
      const user = await this.usersService.registration(newUser);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
