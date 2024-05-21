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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBody({
    type: CreateCategoryDto,
  })
  @ApiResponse({ status: 200, description: 'return category' })
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. This category already exists.',
  })
  @Post('create-category')
  @UseInterceptors(FileInterceptor('file'))
  async createMainCategory(
    @UploadedFile(SharpForOneFile) file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createMainCategory(createCategoryDto, file);
  }

  @ApiBody({
    type: CreateSubcategoryDto,
  })
  @ApiResponse({ status: 200, description: 'return subcategory' })
  @ApiOperation({ summary: 'Create new subcategory' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. This subcategory already exists.',
  })
  @ApiResponse({
    status: 404,
    description: 'Main-category not found.',
  })
  @Post('create-subcategory')
  @UseInterceptors(FileInterceptor('file'))
  async createSubcategory(
    @UploadedFile(SharpForOneFile) file: Express.Multer.File,
    @Body() createSubcategoryDto: CreateSubcategoryDto,
  ) {
    return this.categoryService.createSubcategory(createSubcategoryDto, file);
  }

  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Id category',
  })
  @ApiResponse({ status: 200, description: 'delete and return category' })
  @ApiOperation({ summary: 'delete and return category' })
  @ApiResponse({
    status: 404,
    description: 'Main-category not found.',
  })
  @Delete('delete-category/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }

  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Id subcategory',
  })
  @ApiResponse({ status: 200, description: 'delete and return subcategory' })
  @ApiOperation({ summary: 'delete and return subcategory' })
  @ApiResponse({
    status: 404,
    description: 'This subcategory not found.',
  })
  @ApiResponse({
    status: 404,
    description: 'No main category for this subcategory was found',
  })
  @Delete('delete-subcategory/:id')
  async deleteSubcategory(@Param('id') id: string) {
    return this.categoryService.deleteSubcategory(id);
  }

  @Get()
  async getAllCategory() {
    return this.categoryService.getAllCategory();
  }
}
