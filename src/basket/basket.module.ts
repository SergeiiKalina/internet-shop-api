import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/user.model';
import { Product, ProductSchema } from 'src/products/product.model';
import { ProductsService } from 'src/products/products.service';
import { CommentSchema, Comment } from 'src/comment/comment.model';
import { ImageService } from 'src/products/images-service/images.service';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { Color, ColorSchema } from 'src/color/color.model';
import { CommentService } from 'src/comment/comment.service';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Color.name, schema: ColorSchema },
    ]),
    CommentModule,
  ],
  controllers: [BasketController],
  providers: [BasketService, ProductsService, ImageService],
})
export class BasketModule {}
