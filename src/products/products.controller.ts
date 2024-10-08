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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

import { SortField, SortOrder, sexEnum } from './enum/enumForProducts';
import { RequestWithUser } from 'src/auth/interface/interface';
import { IStatusProduct } from './interfaces/interfaces';
import { ChangeProductStatusDto } from './dto/change-product-status.dto';
@ApiTags('product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('changeStatus/:productId')
  @ApiOperation({
    summary: 'Only authorized users',
  })
  @ApiBody({
    type: ChangeProductStatusDto,
  })
  @ApiResponse({ status: 200, description: 'return product' })
  @ApiOperation({ summary: 'Change status product' })
  @ApiResponse({
    status: 400,
    description: 'Такий товар не знайдено або юзера не знайдено',
  })
  @ApiResponse({
    status: 400,
    description: 'Цей товар не ваш',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changeStatus(
    @Req() req: RequestWithUser,
    @Body() status: IStatusProduct,
    @Param('productId') productId: string,
  ) {
    const userId = req.user.id;

    return this.productsService.changeStatus(userId, productId, status);
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
    files: Express.Multer.File[] | [],
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

  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    enum: SortField,
    description: 'Field to sort by (createDate,price,visit)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    enum: SortOrder,
    description: 'Sort order (asc or desc)',
  })
  @ApiQuery({
    name: 'colors',
    required: false,
    type: [String],
    description: 'Array of Id colors',
  })
  @ApiQuery({
    name: 'sizes',
    required: false,
    type: [String],
    description: 'Array of sizes',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: String,
    description: 'Min price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: String,
    description: 'Max price',
  })
  @ApiQuery({
    name: 'states',
    required: false,
    type: [String],
    description: 'Array of states (Нове, Уживаний товар)',
  })
  @ApiQuery({
    name: 'brands',
    required: false,
    type: [String],
    description: 'Array of brands',
  })
  @ApiQuery({
    name: 'eco',
    required: false,
    type: [Boolean],
    description: 'Array of eco',
  })
  @ApiQuery({
    name: 'isUkraine',
    required: false,
    type: [Boolean],
    description: 'Array of isUkraine',
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
  @ApiQuery({
    name: 'discount',
    required: false,
    type: Boolean,
    description: 'product with discount or not',
  })
  @ApiQuery({
    name: 'sex',
    required: false,
    type: [String],
    description: 'for which  sex is the product (unsex, male, female)',
  })
  @ApiResponse({
    status: 200,
    description:
      'return all product with this subcategory or category and filters and sorted',
  })
  @ApiOperation({
    summary: 'return all product with this subcategory or category and filters',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found. this subcategory or category not found.',
  })
  @Get('filterAndSortedProducts/:subCategoryOrCategory')
  async filterAndSortedProducts(
    @Param('subCategoryOrCategory') subCategoryOrCategory: string,
    @Query('sortField') sortField: SortField = SortField.CREATE,
    @Query('sortOrder') sortOrder: SortOrder = SortOrder.ASC,
    @Query('minPrice') minPrice: number = 0,
    @Query('maxPrice') maxPrice: number = Number.MAX_SAFE_INTEGER,
    @Query('colors') colors: string[] = [],
    @Query('sizes') sizes: string[] = [],
    @Query('states') states: string[] = [],
    @Query('brands') brands: string[] = [],
    @Query('eco') eco: string[] = [],
    @Query('isUkraine') isUkraine: string[] = [],
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('discount') discount: string[] = [],
    @Query('sex') sex: string[] = [],
  ) {
    return this.productsService.filterAndSortedProducts(
      subCategoryOrCategory,
      sortField,
      sortOrder,
      {
        price: { min: +minPrice, max: +maxPrice },
        colors: Array.isArray(colors) ? colors : [colors],
        sizes: Array.isArray(sizes) ? sizes : [sizes],
        states: Array.isArray(states) ? states : [states],
        brands: Array.isArray(brands) ? brands : [brands],
        eco: Array.isArray(eco)
          ? eco.map((el) => (el === 'false' ? false : true))
          : [eco === 'false' ? false : true],
        isUkraine: Array.isArray(isUkraine)
          ? isUkraine.map((el) => (el === 'false' ? false : true))
          : [isUkraine === 'false' ? false : true],
        discount: Array.isArray(discount)
          ? discount.map((el) => (el === 'false' ? false : true))
          : [discount === 'false' ? false : true],
        sex: Array.isArray(sex) ? sex : [sex],
      },
      +page,
      +limit,
    );
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
