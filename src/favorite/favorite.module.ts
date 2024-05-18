import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/user.model';
import { Product, ProductSchema } from 'src/products/product.model';
import { CommentSchema, Comment } from 'src/comment/comment.model';
import { ProductsService } from 'src/products/products.service';
import { ImageService } from 'src/products/images-service/images.service';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
    ]),
  ],

  controllers: [FavoriteController],
  providers: [FavoriteService, ProductsService, ImageService],
})
export class FavoriteModule {}
