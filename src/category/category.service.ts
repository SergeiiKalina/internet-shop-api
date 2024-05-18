import { BadRequestException, Injectable } from '@nestjs/common';
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
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryModel.findOne({
      'mainCategory.ua': createCategoryDto.mainCategory.ua,
    });

    if (category) {
      throw new BadRequestException('This category already exists');
    }
    const { subCategory, ...restCategory } = createCategoryDto;

    const newCategory = await this.categoryModel.create(restCategory);

    const arraySubcategory = Object.entries(subCategory);

    for (let i = 0; i < arraySubcategory.length; i++) {
      const subCategoriesForDb = await this.subCategoryModel.create({
        subCategory: {
          en: arraySubcategory[i][0],
          ua: arraySubcategory[i][1],
        },
        mainCategory: newCategory.id,
      });

      await newCategory.subCategory.push(subCategoriesForDb.id);
      await subCategoriesForDb.save();
    }

    await newCategory.save();
    return newCategory;
  }

  async update(id: string, file: Express.Multer.File) {
    const image = await this.imageService.uploadPhoto(file);

    const category = await this.subCategoryModel.findById(id);

    category.img = image.data.url;
    category.save();
    return category;
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
}
