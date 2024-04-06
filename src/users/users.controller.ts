import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';




@ApiTags('Users')
@Controller('users')
export class UsersController {
    @Get()
    async getAllUsers(@Res() res: Response) {
     
    }
}
