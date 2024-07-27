import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
