import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { UserService } from 'src/user/user.service';
import { ProductsService } from 'src/products/products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/user.model';
import { Product, ProductSchema } from 'src/products/product.model';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { Size, SizeSchema } from 'src/size/size.model';
import { ImageService } from 'src/products/images-service/images.service';
import { CommentService } from 'src/comment/comment.service';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { Comment, CommentSchema } from 'src/comment/comment.model';
import { Color, ColorSchema } from 'src/color/color.model';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';
import { ProductFilterService } from 'src/products/filter/filter.service';
import { Mailer } from 'src/auth/mailer/mailer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Size.name, schema: SizeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Color.name, schema: ColorSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    UserService,
    ProductsService,
    ImageService,
    CommentService,
    CategoryService,
    ColorService,
    TransformImageService,
    ProductFilterService,
    Mailer,
  ],
})
export class PurchaseModule {}
