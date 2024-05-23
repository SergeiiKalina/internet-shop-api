import { BadRequestException, Injectable } from '@nestjs/common';
import { ColorDto } from './dto/create-color.sto';
import { InjectModel } from '@nestjs/mongoose';
import { Color } from './color.model';
import { Model } from 'mongoose';

@Injectable()
export class ColorService {
  constructor(
    @InjectModel(Color.name) private readonly colorModel: Model<Color>,
  ) {}
  async create(colorDto: ColorDto) {
    const color = await this.colorModel.findOne({
      colorName: colorDto.colorName,
    });
    if (color) {
      throw new BadRequestException('Такий колір вже є');
    }
    const newColor = await this.colorModel.create({
      ...colorDto,
      colorName: colorDto.colorName.toLowerCase(),
    });
    return newColor;
  }
}
