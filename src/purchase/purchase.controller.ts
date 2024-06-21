import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @ApiOperation({
    summary: 'Add product in purchase',
  })
  @ApiResponse({
    status: 400,
    description: 'Цей продукт не знайденно',
  })
  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async add(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.purchaseService.add(id, userId);
  }
}
