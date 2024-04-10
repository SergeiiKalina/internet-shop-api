import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './auth.model';
import { Mailer } from './mailer/mailer.service';
import { TokenService } from './jwt/jwt.service';
import { Jwt, JwtSchema } from './jwt/jwt.model';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule,  ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategys/jwt.stategys';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET_KEY,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Mailer, TokenService, UsersService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
