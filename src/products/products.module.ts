import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ImageService } from './images-service/images.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.model';
import { Comment, CommentSchema } from 'src/comment/comment.model';
import { User, UserSchema } from 'src/auth/auth.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ImageService],
})
export class ProductsModule {}
