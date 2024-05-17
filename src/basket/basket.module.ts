import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/user.model';
import { Product, ProductSchema } from 'src/products/product.model';
import { ProductsService } from 'src/products/products.service';
import { CommentSchema, Comment } from 'src/comment/comment.model';
import { ImageService } from 'src/products/images-service/images.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [BasketController],
  providers: [BasketService, ProductsService, ImageService],
})
export class BasketModule {}
