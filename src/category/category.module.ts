import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ImageService } from 'src/products/images-service/images.service';
import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
