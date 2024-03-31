import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './auth.model';
import { Mailer } from './mailer/mailer.service';
import { JwtService } from './jwt/jwt.service';
import { Jwt, JwtSchema } from './jwt/jwt.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, Mailer, JwtService],
})
export class AuthModule {}
