import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Get, Post, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  @Post('create-user')
  async createUser(
    @Body() newUser: { name: string; email: string; password: string },
  ) {
    return this.usersService.createUser(newUser);
  }
}
