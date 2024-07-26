import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.model';
import { Product, ProductSchema } from 'src/products/product.model';
import { User, UserSchema } from 'src/auth/user.model';
import { BasketModule } from 'src/basket/basket.module';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { ProductsService } from 'src/products/products.service';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { ImageService } from 'src/products/images-service/images.service';
import { ProductFilterService } from 'src/products/filter/filter.service';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';
import { ColorModule } from 'src/color/color.module';
import { Color, ColorSchema } from 'src/color/color.model';
import { PurchaseService } from 'src/purchase/purchase.service';
import { PurchaseModule } from 'src/purchase/purchase.module';
import Purchase, { PurchaseSchema } from 'src/purchase/purchase.model';
import { Mailer } from 'src/auth/mailer/mailer.service';
import { TokenService } from 'src/auth/jwt/jwt.service';
import { Jwt, JwtSchema } from 'src/auth/jwt/jwt.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Color.name, schema: ColorSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    ColorModule,
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    UserService,
    ProductsService,
    ImageService,
    ProductFilterService,
    CategoryService,
    ColorService,
    TransformImageService,
    PurchaseService,
    Mailer,
  ],
  exports: [CommentService],
})
export class CommentModule {}
