import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateProductDto } from './dto/update-product.dto';
import { SharpPipe } from './pipes/sharp.pipe';
import { Product } from './product.model';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 5 * 1024 * 1024;

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}





  @ApiOperation({
    summary: 'Get all Products',
  })
  @ApiOperation({ summary: 'Get all Products' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
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
  @Get('GetProduct/:id')
  async GetProduct(
   @Param('id') id: string,
 ){
   return this.productsService.getProduct(id)
 }

  @Post('create')
  @ApiOperation({
    summary: 'Only authorized users',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        price: { type: 'string' },
        eco: { type: 'boolean', default: true },
        discount: { type: 'boolean', default: true },
        discountItem: { type: 'string' },
        category: { type: 'string' },
        subCategory: { type: 'string' },
        state: { type: 'string', default: 'Нове' },
        size: { type: 'string' || null, default: null },
        describe: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(SharpPipe)
    file: Express.Multer.File,
    @Body() newProducts: CreateProductDto,
    @Req() req,
  ) {
    const id = req.user.id;
    return this.productsService.create(newProducts, file, id);
  }


 

  @Patch('update')
  @UseInterceptors(FileInterceptor('img'))
  async updateProduct(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES,
          }),
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() newProducts: UpdateProductDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.productsService.updateProduct(newProducts, file, userId);
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(+id);
  }
}
