import { Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Patch('add/:productId')
  @ApiResponse({ status: 200, description: 'add product to favorite' })
  @ApiOperation({ summary: 'add product to favorite' })
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
  async addFavorite(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.favoriteService.addToFavorite(productId, userId);
  }
  @Patch('remove/:productId')
  @ApiResponse({ status: 200, description: 'remove product to favorite' })
  @ApiOperation({ summary: 'remove product to favorite' })
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
  async removeFavorite(@Param('productId') productId: string, @Req() req) {
    const userId = req.user.id;
    return this.favoriteService.removeFavorite(productId, userId);
  }
}
