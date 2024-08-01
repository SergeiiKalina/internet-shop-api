import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from 'src/auth/interface/interface';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
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
    return await this.userService.getGuestsUserInfo(userId);
  }
  @Post()
  @ApiOperation({
    summary: 'Only authorized user',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'return user' })
  @ApiOperation({ summary: 'Update user data' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('img'))
  async updateUser(
    @Req() req: RequestWithUser,
    @Body(new ValidationPipe()) updateUser: UpdateUserDto,
    @UploadedFile()
    img?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.userService.updateUser(userId, updateUser, img);
  }
}
