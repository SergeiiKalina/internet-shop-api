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
import { ProductsService } from 'src/products/products.service';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { Color, ColorSchema } from 'src/color/color.model';
import { ImageService } from 'src/products/images-service/images.service';
import { CommentService } from 'src/comment/comment.service';
import { ProductFilterService } from 'src/products/filter/filter.service';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';
import { Comment, CommentSchema } from 'src/comment/comment.model';
import Purchase, { PurchaseSchema } from 'src/purchase/purchase.model';
import { PurchaseService } from 'src/purchase/purchase.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Color.name, schema: ColorSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Purchase.name, schema: PurchaseSchema },
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
    ProductsService,
    ImageService,
    CommentService,
    ProductFilterService,
    CategoryService,
    ColorService,
    TransformImageService,
    PurchaseService,
    Mailer,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
