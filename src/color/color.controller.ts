import { Body, Controller, Get, Post } from '@nestjs/common';
import { ColorService } from './color.service';
import { ColorDto } from './dto/create-color.sto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('color')
@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}
  @Post('create')
  async create(@Body() colorDto: ColorDto) {
    return this.colorService.create(colorDto);
  }

  @ApiOperation({
    summary: 'Get all colors',
  })
  @ApiResponse({ status: 200, description: 'Return all colors' })
  @Get()
  async getAllColors() {
    return this.colorService.getAllColors();
  }
}
