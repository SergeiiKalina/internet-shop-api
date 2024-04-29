import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from 'src/auth/auth.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }, // Provide the schema for the User model
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
