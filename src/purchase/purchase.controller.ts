import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import ChangeStatusDto from './dto/change-status.dto';

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
    status: 400,
    description: 'Продавця не знайденно',
  })
  @ApiResponse({
    status: 400,
    description: 'Щось пішло не так',
  })
  @ApiResponse({
    status: 400,
    description: 'Продавця не знайденно',
  })
  @ApiBody({
    type: CreatePurchaseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'id product',
  })
  @Post(':id')
  async add(
    @Param('id') id: string,
    @Body(new ValidationPipe()) data: CreatePurchaseDto,
  ) {
    return this.purchaseService.add(id, data, data.userId);
  }

  @ApiOperation({
    summary: 'Змінити статус',
  })
  @ApiResponse({
    status: 400,
    description: 'Цей продукт продаєте не ви',
  })
  @ApiResponse({
    status: 401,
    description: 'Ви не авторизовані',
  })
  @Post('changeStatus/:idPurchase')
  @UseGuards(JwtAuthGuard)
  async changeStatus(
    @Param('idPurchase') idPurchase: string,
    @Body(new ValidationPipe()) status: ChangeStatusDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.purchaseService.changeStatus(idPurchase, status.status, userId);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.purchaseService.delete(id);
  }
}
