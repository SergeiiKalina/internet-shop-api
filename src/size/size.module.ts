import { Module } from '@nestjs/common';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Size, SizeSchema } from './size.model';
import { CategoryService } from 'src/category/category.service';
import { CategoryModule } from 'src/category/category.module';
import { SubCategory, SubcategorySchema } from 'src/category/subCategory.model';
import { Category, CategorySchema } from 'src/category/categoty.model';
import { ImageService } from 'src/products/images-service/images.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Size.name, schema: SizeSchema },
      { name: SubCategory.name, schema: SubcategorySchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CategoryModule,
  ],
  controllers: [SizeController],
  providers: [SizeService, CategoryService, ImageService],
})
export class SizeModule {}
