import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubcategoryDto } from './dto/create-subCategory.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpForOneFile } from './pipe/sharpForOneFile.pipe';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // @Post('create')
  // async create(@Body() createCategoryDto: CreateCategoryDto) {
  //   return this.categoryService.create(createCategoryDto);
  // }

  // @Patch('update/:id')
  // @UseInterceptors(FileInterceptor('file'))
  // async createSubcategory(
  //   @UploadedFile(SharpForOneFile)
  //   file: Express.Multer.File,
  //   @Param('id') id: string,
  // ) {
  //   return this.categoryService.update(id, file);
  // }

  @Get()
  async getAllCategory() {
    return this.categoryService.getAllCategory();
  }
}
