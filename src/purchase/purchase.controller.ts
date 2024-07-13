import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@ApiTags('purchase')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @ApiOperation({
    summary:
      'Замовити продукт і відправлення емейлів на пошту продацю і покупцю',
  })
  @ApiResponse({
    status: 400,
    description: 'Цей продукт не знайденно',
  })
  @ApiResponse({
    status: 401,
    description: 'Ви не авторизовані',
  })
  @ApiBody({
    type: CreatePurchaseDto,
  })
  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async add(
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: CreatePurchaseDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.purchaseService.add(id, userId, data);
  }

  @ApiOperation({
    summary: 'Змінити статус',
  })
  @ApiResponse({
    status: 400,
    description: 'Цей продукт не знайденно',
  })
  @ApiResponse({
    status: 401,
    description: 'Ви не авторизовані',
  })
  @Post('changeStatus')
  async changeStatus() {}
}
