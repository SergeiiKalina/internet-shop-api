import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/user.model';
import { Product, ProductSchema } from 'src/products/product.model';
import { CommentSchema, Comment } from 'src/comment/comment.model';
import { ProductsService } from 'src/products/products.service';
import { ImageService } from 'src/products/images-service/images.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],

  controllers: [FavoriteController],
  providers: [FavoriteService, ProductsService, ImageService],
})
export class FavoriteModule {}
