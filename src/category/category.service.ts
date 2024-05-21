import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './categoty.model';
import { Model } from 'mongoose';
import { CreateSubcategoryDto } from './dto/create-subCategory.dto';
import { SubCategory } from './subCategory.model';
import { ImageService } from 'src/products/images-service/images.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
    private readonly imageService: ImageService,
  ) {}
  async createMainCategory(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
  ) {
    const category = await this.categoryModel.findOne({
      'mainCategory.ua': createCategoryDto.ua,
    });

    if (category) {
      throw new BadRequestException('This category already exists');
    }
    const image = await this.imageService.uploadPhoto(file);

    const newCategory = await this.categoryModel.create({
      ...createCategoryDto,
      mainCategory: { en: createCategoryDto.en, ua: createCategoryDto.ua },
      img: image.data.url,
    });

    await newCategory.save();
    return newCategory;
  }

  async createSubcategory(
    createSubcategoryDto: CreateSubcategoryDto,
    file: Express.Multer.File,
  ) {
    const subcategory = await this.subCategoryModel.findOne({
      'subCategory.ua': createSubcategoryDto.ua,
    });
    if (subcategory) {
      throw new BadRequestException('This subcategory already exists');
    }
    const image = await this.imageService.uploadPhoto(file);

    const mainCategory = await this.categoryModel.findById(
      createSubcategoryDto.mainCategory,
    );
    if (!mainCategory) {
      throw new NotFoundException('Main-category not found');
    }

    const newSubcategory = await this.subCategoryModel.create({
      mainCategory: createSubcategoryDto.mainCategory,
      subCategory: { en: createSubcategoryDto.en, ua: createSubcategoryDto.ua },
      img: image.data.url,
    });
    await newSubcategory.save();

    await mainCategory.subCategory.push(newSubcategory.id);

    await mainCategory.save();

    return newSubcategory;
  }

  async getAllCategory() {
    const categories = await this.categoryModel.find().exec();
    const fullCategories = await Promise.all(
      categories.map(async (category) => {
        const subCategoryPromises = category.subCategory.map((subCategoryId) =>
          this.subCategoryModel.findById(subCategoryId).exec(),
        );

        const subCategories = await Promise.all(subCategoryPromises);

        return {
          ...category.toObject(),
          subCategory: subCategories.map((subCategory) =>
            subCategory.toObject(),
          ),
        };
      }),
    );

    return fullCategories;
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundException('This category not found');
    }
    return category;
  }

  async deleteSubcategory(id: string) {
    const subcategory = await this.subCategoryModel.findByIdAndDelete(id);
    if (!subcategory) {
      throw new NotFoundException('This subcategory not found');
    }
    const category = await this.categoryModel.findById(
      subcategory.mainCategory,
    );
    if (!category) {
      throw new NotFoundException(
        'No main category for this subcategory was found',
      );
    }

    const index = category.subCategory.indexOf(subcategory.id);

    category.subCategory.splice(index, 1);

    await category.save();
    return subcategory;
  }
}
