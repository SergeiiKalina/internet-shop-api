import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './auth/user.model';
import { Jwt, JwtSchema } from './auth/jwt/jwt.model';
import { Product, ProductSchema } from './products/product.model';
import { Category, CategorySchema } from './category/categoty.model';
import { SubCategory, SubcategorySchema } from './category/subCategory.model';
import { Color, ColorSchema } from './color/color.model';
import { Comment, CommentSchema } from './comment/comment.model';
import Purchase, { PurchaseSchema } from './purchase/purchase.model';
import { Size, SizeSchema } from './size/size.model';
import { ProductsService } from './products/products.service';
import { ImageService } from './products/images-service/images.service';
import { CommentService } from './comment/comment.service';
import { ProductFilterService } from './products/filter/filter.service';
import { CategoryService } from './category/category.service';
import { ColorService } from './color/color.service';
import { TransformImageService } from './products/images-service/transform-image.sevice';
import { UserService } from './user/user.service';
import { PurchaseService } from './purchase/purchase.service';
import { Mailer } from './auth/mailer/mailer.service';

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
      { name: Size.name, schema: SizeSchema },
    ]),
  ],
  providers: [
    ProductsService,
    ImageService,
    ImageService,
    CommentService,
    ProductFilterService,
    CategoryService,
    ColorService,
    TransformImageService,
    UserService,
    PurchaseService,
    Mailer,
  ],
  exports: [
    MongooseModule,
    ProductsService,
    ImageService,
    CommentService,
    ProductFilterService,
    CategoryService,
    ColorService,
    TransformImageService,
    UserService,
    PurchaseService,
    Mailer,
  ],
})
export default class CommonModule {}
