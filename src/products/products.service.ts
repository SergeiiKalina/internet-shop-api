import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';
import { ImageService } from './images-service/images.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/category/categoty.model';
import { SubCategory } from 'src/category/subCategory.model';
import { CommentService } from 'src/comment/comment.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';
import { Size } from 'src/size/size.model';
import { TransformImageService } from './images-service/transform-image.sevice';
import { ProductFilterService } from './filter/filter.service';
import { FiltersDto } from './dto/filters.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    private readonly imageService: ImageService,
    private readonly commentService: CommentService,
    private readonly productFilterService: ProductFilterService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly categoryService: CategoryService,
    private readonly colorService: ColorService,
    private readonly transformImageService: TransformImageService,
  ) {}

  async searchProducts(title: string): Promise<Product[]> {
    const regex = new RegExp(`^${title}`, 'i'); // Case-insensitive search for names starting with 'firstLetter'
    return this.productModel
      .find({ title: regex })
      .populate({ path: 'category', select: 'mainCategory -_id' })
      .populate({
        path: 'subCategory',
        select: 'subCategory -_id',
      })
      .populate('parameters.color')
      .populate(
        'producer',
        '-password -isActivated -activationLink -lastLogout -favorites -registrationDate -basket -purchasedGoods -soldGoods',
      )
      .exec();
  }

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    id: string,
  ) {
    const { color, size, state, brand, eco, isUkraine, ...restProduct } =
      createProductDto;

    const imagesPromise = this.imageService.uploadPhotos(files);
    const circlePromise = this.transformImageService.transform(files[0]);
    const categoryIdPromise = this.categoryService.findCategoryByName(
      createProductDto.category,
    );
    const subCategoryIdPromise = this.categoryService.findSubcategoryByName(
      createProductDto.subCategory,
    );
    const allColorPromise = this.colorService.getColorsByName(color);
    const [images, circle, categoryId, subCategoryId, allColor] =
      await Promise.all([
        imagesPromise,
        circlePromise,
        categoryIdPromise,
        subCategoryIdPromise,
        allColorPromise,
      ]);
    const minImage = await this.imageService.uploadPhoto(circle);

    const product = await this.productModel.create({
      ...restProduct,
      category: categoryId,
      subCategory: subCategoryId,
      img: images,
      producer: id,
      minImage,
      parameters: {
        color: allColor,
        size,
        state,
        brand,
        eco,
        isUkraine,
      },
    });
    if (!product) {
      throw new BadRequestException(
        'Щось сталось не так з завантаженням продукту',
      );
    }
    return product;
  }

  async updateProduct(
    updateProduct: UpdateProductDto,
    files: Express.Multer.File[],
    userId: string,
    id: string,
  ) {
    let product = await this.productModel.findById(id);
    if (!product) {
      throw new BadRequestException('Цей продукт не знайдено');
    }
    const images = await this.imageService.uploadPhotos(files);
    const category = await this.categoryModel.findOne({
      'mainCategory.ua': updateProduct.category,
    });

    const subCategory = await this.subCategoryModel.findOne({
      'subCategory.ua': updateProduct.subCategory,
    });

    Object.assign(product, updateProduct);

    const allColor = await this.colorService.getColorsByName(
      updateProduct.color,
    );

    product.img = images;
    product.producer = userId;
    product.category = category.id;
    product.subCategory = subCategory.id;
    product.parameters = {
      ...product.parameters,
      eco: updateProduct.eco,
      size: updateProduct.size,
      state: updateProduct.state,
      brand: updateProduct.brand,
      isUkraine: updateProduct.isUkraine,
      color: allColor,
    };

    await product.save();
    await this.cacheManager.del(id.toString());
    return product;
  }

  async getAllProducts(
    page: number,
    limit: number = 20,
  ): Promise<{ products: Product[]; totalItems: number }> {
    const startIndex = (page - 1) * limit;

    const products = await this.productModel
      .find()
      .populate({ path: 'category', select: 'mainCategory -_id' })
      .populate({
        path: 'subCategory',
        select: 'subCategory -_id',
      })
      .populate('parameters.color')
      .populate(
        'producer',
        '-password -isActivated -activationLink -lastLogout -favorites -registrationDate -basket -purchasedGoods -soldGoods',
      )
      .skip(startIndex)
      .limit(limit)
      .exec();

    const totalItems = await this.productModel.countDocuments().exec();

    return { products, totalItems };
  }

  async getProduct(id: string) {
    const cacheProduct = await this.cacheManager.get(id);

    if (!cacheProduct) {
      const product = await this.findProductById(id);
      if (!product) {
        throw new BadRequestException('Щось пішло не так');
      }

      const allComment = await this.commentService.getAllFullCommentForProduct(
        product.comments,
      );

      const returnProduct = {
        ...product.toObject(),
        comments: allComment,
      };

      await this.cacheManager.set(id.toString(), returnProduct, 1000 * 60 * 3);
      await this.productModel.findByIdAndUpdate(id, { $inc: { visit: 1 } });
      return returnProduct;
    }
    await this.productModel.findByIdAndUpdate(id, { $inc: { visit: 1 } });

    return cacheProduct;
  }

  async getMinProduct(id: string) {
    const product = await this.findProductById(id);
    const { category, producer, describe, comments, ...restProduct } =
      product.toObject();

    const { color, size, state, ...restParameters } = restProduct.parameters;
    return {
      ...restProduct,
      parameters: restParameters,
    };
  }

  async delete(id: string) {
    const deleteProduct = this.productModel.findByIdAndDelete(id);

    return deleteProduct;
  }

  async findProductById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate({ path: 'category', select: 'mainCategory -_id' })
      .populate({
        path: 'subCategory',
        select: 'subCategory -_id',
      })
      .populate('parameters.color')
      .populate(
        'producer',
        '-password -isActivated -activationLink -lastLogout -favorites -registrationDate -basket -purchasedGoods -soldGoods',
      )
      .populate('comments');
    if (!product) {
      throw new BadRequestException('Цей продукт не знайденно');
    }

    return product;
  }

  async filterBySubcategory(subCategory: string) {
    const nameSubCategory = await this.subCategoryModel.findOne({
      'subCategory.en': subCategory,
    });

    if (!nameSubCategory) {
      throw new NotFoundException('Ця підкатегорія не знайденна');
    }

    const allProductWithThisSubCategory = await this.productModel
      .find({
        subCategory: nameSubCategory._id,
      })
      .populate({ path: 'category', select: 'mainCategory -_id' })
      .populate({
        path: 'subCategory',
        select: 'subCategory -_id',
      })
      .populate('parameters.color')
      .populate(
        'producer',
        '-password -isActivated -activationLink -lastLogout -favorites -registrationDate -basket -purchasedGoods -soldGoods',
      );
    const filters = await this.productFilterService.createFiltersData(
      allProductWithThisSubCategory,
    );

    return {
      products: allProductWithThisSubCategory,
      filters,
    };
  }

  async filterByCategory(category: string) {
    const nameCategory = await this.categoryModel.findOne({
      'mainCategory.en': category,
    });

    if (!nameCategory) {
      throw new NotFoundException('Ця категорія не знайдена');
    }
    const allProductWithThisCategory = await this.productModel
      .find({
        category: nameCategory._id,
      })
      .populate({ path: 'category', select: 'mainCategory -_id' })
      .populate({
        path: 'subCategory',
        select: 'subCategory -_id',
      })
      .populate('parameters.color')
      .populate(
        'producer',
        '-password -isActivated -activationLink -lastLogout -favorites -registrationDate -basket -purchasedGoods -soldGoods',
      )
      .exec();

    const filters = await this.productFilterService.createFiltersData(
      allProductWithThisCategory,
    );
    return {
      products: allProductWithThisCategory,
      filters,
    };
  }

  async filterProduct(filters: FiltersDto) {
    const category = await this.categoryModel.findOne({
      'mainCategory.en': filters.nameCategoryOrSubcategory,
    });
    const subcategory = await this.subCategoryModel.findOne({
      'subCategory.en': filters.nameCategoryOrSubcategory,
    });

    if (!category && !subcategory) {
      throw new BadRequestException(
        'Такої Категорії або підкатегорії не існує',
      );
    }
    const categoryId = category ? category.id : '';
    const subcategoryId = subcategory ? subcategory.id : '';
    const products = await this.productModel.aggregate([
      {
        $match: {
          $or: [{ category: categoryId }, { subCategory: subcategoryId }],
          price: { $gte: filters.price.min, $lte: filters.price.max },
          'parameters.color': {
            $in: filters.colors.length ? filters.colors : [/.*/],
          },
          'parameters.size': {
            $in: filters.sizes.length ? filters.sizes : [/.*/],
          },
          'parameters.state': {
            $in: filters.states.length ? filters.states : [/.*/],
          },
          'parameters.eco': {
            $in: filters.eco.length ? filters.eco : [true, false],
          },
          'parameters.isUkraine': {
            $in: filters.IsUkraine.length ? filters.IsUkraine : [true, false],
          },
        },
      },
    ]);

    return products;
  }

  // async changeAllCategory() {
  //   const subcategory = await this.subCategoryModel.findOne({
  //     'subCategory.en': 'souvenirs',
  //   });

  //   if (!subcategory) {
  //     throw new Error('Subcategory not found');
  //   }

  //   const products = await this.productModel.aggregate([
  //     { $match: { subCategory: subcategory.id } },
  //     {
  //       $group: {
  //         _id: subcategory._id,
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' },
  //         states: { $addToSet: '$parameters.state' },
  //         sizes: { $addToSet: '$parameters.size' },
  //         colors: { $addToSet: '$parameters.color' },
  //         sexes: { $addToSet: '$parameters.sex' },
  //       },
  //     },
  //     {
  //       $project: {
  //         minPrice: 1,
  //         maxPrice: 1,
  //         states: {
  //           $reduce: {
  //             input: {
  //               $map: {
  //                 input: '$states',
  //                 as: 'state',
  //                 in: {
  //                   $cond: {
  //                     if: { $isArray: '$$state' },
  //                     then: '$$state',
  //                     else: ['$$state'],
  //                   },
  //                 },
  //               },
  //             },
  //             initialValue: [],
  //             in: { $setUnion: ['$$value', '$$this'] },
  //           },
  //         },
  //         sizes: {
  //           $reduce: {
  //             input: {
  //               $map: {
  //                 input: '$sizes',
  //                 as: 'size',
  //                 in: {
  //                   $cond: {
  //                     if: { $isArray: '$$size' },
  //                     then: '$$size',
  //                     else: ['$$size'],
  //                   },
  //                 },
  //               },
  //             },
  //             initialValue: [],
  //             in: { $setUnion: ['$$value', '$$this'] },
  //           },
  //         },
  //         colors: {
  //           $reduce: {
  //             input: {
  //               $map: {
  //                 input: '$colors',
  //                 as: 'color',
  //                 in: {
  //                   $cond: {
  //                     if: { $isArray: '$$color' },
  //                     then: '$$color',
  //                     else: ['$$color'],
  //                   },
  //                 },
  //               },
  //             },
  //             initialValue: [],
  //             in: { $setUnion: ['$$value', '$$this'] },
  //           },
  //         },
  //         sexes: {
  //           $reduce: {
  //             input: {
  //               $map: {
  //                 input: '$sexes',
  //                 as: 'sex',
  //                 in: {
  //                   $cond: {
  //                     if: { $isArray: '$$sex' },
  //                     then: '$$sex',
  //                     else: ['$$sex'],
  //                   },
  //                 },
  //               },
  //             },
  //             initialValue: [],
  //             in: { $setUnion: ['$$value', '$$this'] },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $project: {
  //         minPrice: 1,
  //         maxPrice: 1,
  //         states: {
  //           $filter: {
  //             input: '$states',
  //             as: 'state',
  //             cond: { $ne: ['$$state', ''] },
  //           },
  //         },
  //         sizes: {
  //           $filter: {
  //             input: '$sizes',
  //             as: 'size',
  //             cond: { $ne: ['$$size', ''] },
  //           },
  //         },
  //         colors: {
  //           $filter: {
  //             input: '$colors',
  //             as: 'color',
  //             cond: { $ne: ['$$color', ''] },
  //           },
  //         },
  //         sexes: {
  //           $filter: {
  //             input: '$sexes',
  //             as: 'sex',
  //             cond: { $ne: ['$$sex', ''] },
  //           },
  //         },
  //       },
  //     },
  //   ]);
  //   return products;
  // }
}
