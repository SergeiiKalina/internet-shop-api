import {
  Controller,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('basket')
@Controller('basket')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Patch(':productId')
  @ApiResponse({ status: 200, description: 'add product to basket' })
  @ApiOperation({ summary: 'add product to basket' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiQuery({
    name: 'productId',
    required: true,
    type: String,
    description: 'id product',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addToBasket(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.basketService.addToBasket(productId, userId);
  }

  @Delete(':productId')
  @ApiResponse({ status: 200, description: 'delete product from basket' })
  @ApiOperation({ summary: 'delete product from basket' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiQuery({
    name: 'productId',
    required: true,
    type: String,
    description: 'id product',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async Delete(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.basketService.delete(productId, userId);
  }

  @Patch('increase/:productId')
  @ApiResponse({ status: 200, description: 'increase quantity product' })
  @ApiOperation({ summary: 'increase quantity product' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiQuery({
    name: 'productId',
    required: true,
    type: String,
    description: 'id product',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async increase(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.basketService.increase(productId, userId);
  }
  @Patch('decrease/:productId')
  @ApiResponse({ status: 200, description: 'decrease quantity product' })
  @ApiOperation({ summary: 'decrease quantity product' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User needs to be authenticated.',
  })
  @ApiQuery({
    name: 'productId',
    required: true,
    type: String,
    description: 'id product',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async decrease(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.basketService.decrease(productId, userId);
  }
}
