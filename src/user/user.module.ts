import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from 'src/auth/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/products/product.model';

import { CommentModule } from 'src/comment/comment.module';
import { ProductsService } from 'src/products/products.service';
import { CategoryModule } from 'src/category/category.module';
import { ColorModule } from 'src/color/color.module';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { Color, ColorSchema } from 'src/color/color.model';
import { ImageService } from 'src/products/images-service/images.service';
import { ProductFilterService } from 'src/products/filter/filter.service';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';
import { PurchaseService } from 'src/purchase/purchase.service';
import Purchase, { PurchaseSchema } from 'src/purchase/purchase.model';
import { Mailer } from 'src/auth/mailer/mailer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }, // Provide the schema for the User model\
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Color.name, schema: ColorSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
    CommentModule,
    CategoryModule,
  ],
  controllers: [UserController],
  providers: [
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
})
export class UserModule {}
