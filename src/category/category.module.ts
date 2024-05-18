import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './categoty.model';
import { SubcategorySchema, SubCategory } from './subCategory.model';
import { ImageService } from 'src/products/images-service/images.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubcategorySchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, ImageService],
})
export class CategoryModule {}
