import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  Query,
  Patch,
  ValidationPipe,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateProductDto } from './dto/update-product.dto';
import { SharpPipe } from './pipes/sharpForFewFile.pipe';
import { Product } from './product.model';

@ApiTags('product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  async searchProductsByFirstLetter(
    @Query('title') title: string,
  ): Promise<Product[]> {
    return this.productsService.searchProducts(title);
  }

  @ApiOperation({
    summary: 'Get all Products',
  })
  @ApiOperation({ summary: 'Get all Products' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Returns all products' })
  @Get()
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Product[]> {
    return this.productsService.getAllProducts(page, limit);
  }

  @ApiOperation({
    summary: 'Get product',
  })
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Only authorized users',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateProductDto,
  })
  @ApiResponse({ status: 200, description: 'return product' })
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('file', 10))
  async create(
    @UploadedFiles(SharpPipe)
    files: Express.Multer.File[],
    @Body()
    newProduct: CreateProductDto,
    @Req() req,
  ) {
    const id = req.user.id;
    return this.productsService.create(newProduct, files, id);
  }

  @Patch('update/:id')
  @ApiOperation({
    summary: 'Only authorized users',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiResponse({ status: 200, description: 'return product' })
  @ApiOperation({ summary: 'update product' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('file', 10))
  async updateProduct(
    @UploadedFiles(SharpPipe)
    files: Express.Multer.File[],
    @Body() newProducts: UpdateProductDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.productsService.updateProduct(newProducts, files, userId, id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Id product',
  })
  @ApiResponse({ status: 200, description: 'return deleted product' })
  @ApiOperation({ summary: 'delete product' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @ApiParam({
    name: 'subCategory',
    required: true,
    type: String,
    description: 'product subcategory in eng',
  })
  @ApiResponse({
    status: 200,
    description: 'return all product with this subcategory',
  })
  @ApiOperation({ summary: 'return all product with this subcategory' })
  @ApiResponse({
    status: 404,
    description: 'Not Found. this subcategory not found.',
  })
  @Get('filterBySubcategory/:subCategory')
  async filterBySubcategory(@Param('subCategory') subCategory: string) {
    return this.productsService.filterBySubcategory(subCategory);
  }

  @ApiParam({
    name: 'category',
    required: true,
    type: String,
    description: 'product category in eng',
  })
  @ApiResponse({
    status: 200,
    description: 'return all product with this category',
  })
  @ApiOperation({ summary: 'return all product with this category' })
  @ApiResponse({
    status: 404,
    description: 'Not Found. this category not found.',
  })
  @Get('filterByCategory/:category')
  async filterByCategory(@Param('category') category: string) {
    return this.productsService.filterByCategory(category);
  }
}
