import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  Query,
  Patch,
  UploadedFiles,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
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
import { FiltersDto } from './dto/filters.dto';
@ApiTags('product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Get('change')
  // async changeAllCategory() {
  //   return await this.productsService.changeAllCategory();
  // }

  @ApiOperation({
    summary: 'Get filtered products',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: FiltersDto,
  })
  @ApiResponse({ status: 200, description: 'return products' })
  @ApiOperation({ summary: 'Get filtered products' })
  @ApiResponse({
    status: 400,
    description: 'Такої Категорії або підкатегорії не існує',
  })
  @Post('filter')
  async filterProduct(@Body() filters: FiltersDto) {
    return await this.productsService.filterProduct(filters);
  }
  @Get('search')
  async searchProductsByFirstLetter(
    @Query('title') title: string,
  ): Promise<Product[]> {
    return this.productsService.searchProducts(title);
  }

  @ApiOperation({
    summary: 'Get all Products',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all products with pagination info',
  })
  @Get()
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{
    products: Product[];
    totalPages: number;
    totalItems: number;
    filters: any;
  }> {
    page = Number(page);
    limit = Number(limit);

    // Переконайтеся, що page і limit мають коректні значення
    if (page < 1) {
      page = 1;
    }
    if (limit > 20) {
      // наприклад, обмеження в 20 продуктів
      limit = 20;
    }

    const { products, totalItems, filters } =
      await this.productsService.getAllProducts(page, limit);
    const totalPages = Math.ceil(totalItems / limit);

    return { products, totalPages, totalItems, filters };
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
    @Body(new ValidationPipe({ transform: true }))
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
    @Body(new ValidationPipe({ transform: true }))
    newProducts: UpdateProductDto,
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
    description: 'return all product with this subcategory and filters',
  })
  @ApiOperation({
    summary: 'return all product with this subcategory and filters',
  })
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
    description: 'return all products with this category',
  })
  @ApiOperation({ summary: 'return all products with this category' })
  @ApiResponse({
    status: 404,
    description: 'Not Found. this category not found.',
  })
  @Get('filterByCategory/:category')
  async filterByCategory(@Param('category') category: string) {
    return this.productsService.filterByCategory(category);
  }

  @ApiResponse({
    status: 200,
    description: 'return product with this category',
  })
  @ApiOperation({ summary: 'return product with this category' })
  @ApiResponse({
    status: 404,
    description: 'this product not found.',
  })
  @Get('getMinProduct/:id')
  async getMinProduct(@Param('id') id: string) {
    return this.productsService.getMinProduct(id);
  }
}
