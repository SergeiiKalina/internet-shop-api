import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('Get all users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.getUser(id);
  }
  @Get('profile/:userId')
  async getGuestUserInfo(@Param('userId') userId: string) {
    return await this.userService.getGuestsUserInfo(userId)
  }
}
