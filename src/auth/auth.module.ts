import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.model';
import { Mailer } from './mailer/mailer.service';
import { TokenService } from './jwt/jwt.service';
import { Jwt, JwtSchema } from './jwt/jwt.model';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategys/jwt.stategys';
import { FacebookStrategy } from './strategys/facebook.strategy';
import { FacebookTokenStrategy } from './strategys/facebookToken.strategy';
import { GoogleAuthStrategy } from './strategys/google.strategy';
import { Product, ProductSchema } from 'src/products/product.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
      { name: Product.name, schema: ProductSchema },
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
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    Mailer,
    TokenService,
    UserService,
    JwtStrategy,
    FacebookStrategy,
    FacebookTokenStrategy,
    GoogleAuthStrategy,
    ConfigService,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
