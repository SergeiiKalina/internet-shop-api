import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSizeDto } from './dto/create-size.dto';
import { Size } from './size.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryService } from 'src/category/category.service';
import { spread } from 'axios';
import { SubCategory } from 'src/category/subCategory.model';

@Injectable()
export class SizeService {
  constructor(
    @InjectModel(Size.name) private sizeModel: Model<Size>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    private readonly categoryService: CategoryService,
  ) {}
  async create(createSizeDto: CreateSizeDto) {
    const size = await this.sizeModel.create(createSizeDto);
    for (let el of createSizeDto.subCategory) {
      const subcategory = await this.subCategoryModel.findById(el);
      if (!subcategory) {
        throw new BadRequestException('subcategory not found');
      }
      subcategory.sizeChart = size.id;
      await subcategory.save();
    }

    await size.save();
    return size;
  }

  findAll() {
    return `This action returns all size`;
  }

  findOne(id: number) {
    return `This action returns a #${id} size`;
  }

  update(id: number) {
    return `This action updates a #${id} size`;
  }

  remove(id: number) {
    return `This action removes a #${id} size`;
  }
}
