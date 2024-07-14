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
import { Color, ColorSchema } from 'src/color/color.model';
import { CommentModule } from 'src/comment/comment.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { Size, SizeSchema } from 'src/size/size.model';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';
import { ProductFilterService } from 'src/products/filter/filter.service';
import Purchase, { PurchaseSchema } from 'src/purchase/purchase.model';
import { PurchaseService } from 'src/purchase/purchase.service';
import { Mailer } from 'src/auth/mailer/mailer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Color.name, schema: ColorSchema },
      { name: Size.name, schema: SizeSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    CommentModule,
  ],

  controllers: [FavoriteController],
  providers: [
    FavoriteService,
    ProductsService,
    ImageService,
    UserService,
    CategoryService,
    ColorService,
    TransformImageService,
    ProductFilterService,
    PurchaseService,
    Mailer,
  ],
})
export class FavoriteModule {}
