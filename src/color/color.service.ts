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
      colorName: colorDto.colorName.toLowerCase(),
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

  async getAllColors() {
    return this.colorModel.find().exec();
  }

  async getColorsByIds(ids: string[]) {
    const colors = await this.colorModel.find({ _id: { $in: ids } }).exec();
    if (!colors) {
      throw new BadRequestException('Ids colors not correct');
    }
    return colors;
  }
  async getColorsByName(names: string[]) {
    const colors = await this.colorModel
      .find({ colorName: { $in: names } })
      .exec();
    if (colors.length === 0 && names.length > 0) {
      throw new BadRequestException(
        'Не знайдено жодного кольору за вказаними іменами',
      );
    }
    return colors.map((el) => el.id);
  }
}
