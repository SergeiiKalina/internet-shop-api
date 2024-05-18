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
import { CategoryModule } from 'src/category/category.module';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
    ]),
    ConfigModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ImageService,
    FacebookTokenStrategy,
    JwtAuthGuard,
  ],
})
export class ProductsModule {}
