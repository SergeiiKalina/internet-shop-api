import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ImageService } from './images-service/images.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.model';
import { Comment, CommentSchema } from 'src/comment/comment.model';
import { User, UserSchema } from 'src/auth/user.model';
import { FacebookTokenStrategy } from 'src/auth/strategys/facebookToken.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Jwt, JwtSchema } from 'src/auth/jwt/jwt.model';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { Color, ColorSchema } from 'src/color/color.model';
import { CommentModule } from 'src/comment/comment.module';
import { UserService } from 'src/user/user.service';
import { BasketModule } from 'src/basket/basket.module';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { Size, SizeSchema } from 'src/size/size.model';
import { TransformImageService } from './images-service/transform-image.sevice';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Color.name, schema: ColorSchema },
      { name: Size.name, schema: SizeSchema },
    ]),
    ConfigModule,
    CommentModule,
    BasketModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ImageService,
    FacebookTokenStrategy,
    JwtAuthGuard,
    UserService,
    CategoryService,
    ColorService,
    TransformImageService,
  ],
})
export class ProductsModule {}
