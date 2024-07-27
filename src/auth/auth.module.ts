import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Mailer } from './mailer/mailer.service';
import { TokenService } from './jwt/jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategys/jwt.stategys';
import { FacebookStrategy } from './strategys/facebook.strategy';
import { FacebookTokenStrategy } from './strategys/facebookToken.strategy';
import { GoogleAuthStrategy } from './strategys/google.strategy';
import { ProductsService } from 'src/products/products.service';
import { ImageService } from 'src/products/images-service/images.service';
import { CommentService } from 'src/comment/comment.service';
import { ProductFilterService } from 'src/products/filter/filter.service';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';
import { PurchaseService } from 'src/purchase/purchase.service';
import CommonModule from 'src/common.module';

@Module({
  imports: [
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
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    FacebookStrategy,
    FacebookTokenStrategy,
    GoogleAuthStrategy,
    ConfigService,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
