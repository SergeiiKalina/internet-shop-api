import { Body, Controller, Post } from '@nestjs/common';
import { ColorService } from './color.service';
import { ColorDto } from './dto/create-color.sto';

@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}
  @Post('create')
  async create(@Body() colorDto: ColorDto) {
    return this.colorService.create(colorDto);
  }
}
