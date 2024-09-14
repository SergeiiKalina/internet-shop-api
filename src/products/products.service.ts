import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model, SortOrder, Types } from 'mongoose';
import { ImageService } from './images-service/images.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../category/categoty.model';
import { SubCategory } from '../category/subCategory.model';
import { CommentService } from '../comment/comment.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { TransformImageService } from './images-service/transform-image.sevice';
import { ProductFilterService } from './filter/filter.service';
import { FiltersDto } from './dto/filters.dto';
import {
  addEffectivePrice,
  aggregateForAllProductsInThisCategory,
  aggregateForFiltersAndSortedProducts,
} from './aggregates/aggregates';
import { CounterProducts } from './counter.model';
import { IStatusProduct } from './interfaces/interfaces';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(CounterProducts.name)
    private counterModel: Model<CounterProducts>,
    private readonly imageService: ImageService,
    private readonly commentService: CommentService,
    private readonly productFilterService: ProductFilterService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly categoryService: CategoryService,
    private readonly colorService: ColorService,
    private readonly transformImageService: TransformImageService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async searchProducts(title: string): Promise<Product[]> {
    const regex = new RegExp(`.*${title}.*`, 'i'); // Case-insensitive search for names starting with 'firstLetter'
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
    let subCategoryIdPromise;

    if (!(createProductDto.category === 'Подарую')) {
      subCategoryIdPromise = this.categoryService.findSubcategoryByName(
        createProductDto.subCategory,
      );
    }

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

    const counter = await this.counterModel
      .findOneAndUpdate(
        { _id: '66bc791485a8e27d76fa842a' },
        { $inc: { counter: 1 } },
        { new: true, upsert: true },
      )
      .exec();

    const product = await this.productModel.create({
      ...restProduct,
      price:
        createProductDto.category === 'Подарую' && !createProductDto.price
          ? 0
          : createProductDto.price,
      discount:
        createProductDto.category === 'Подарую' && !createProductDto.discount
          ? false
          : createProductDto.discount,
      discountPrice:
        createProductDto.category === 'Подарую' &&
        !createProductDto.discountPrice
          ? 0
          : createProductDto.discountPrice,
      category: categoryId,
      subCategory: subCategoryId ? subCategoryId : null,
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
        sex: createProductDto.sex,
      },
      count: counter.counter,
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
    let images;
    if (files.length) {
      images = await this.imageService.uploadPhotos(files);
    }
    let category;
    if (updateProduct.category) {
      category = await this.categoryModel.findOne({
        'mainCategory.ua': updateProduct.category,
      });
    }

    let subCategory;
    if (updateProduct.subCategory) {
      subCategory = await this.subCategoryModel.findOne({
        'subCategory.ua': updateProduct.subCategory,
      });
    }

    Object.assign(product, updateProduct);

    let allColor;
    if (updateProduct.color) {
      allColor = await this.colorService.getColorsByName(updateProduct.color);
    }

    product.img = images ? images : product.img;
    product.producer = userId;
    product.category = category ? category.id : product.category;
    product.subCategory = subCategory ? subCategory.id : product.subCategory;
    product.parameters = {
      ...product.parameters,
      eco: updateProduct.eco ? updateProduct.eco : product.parameters.eco,
      size: updateProduct.size ? updateProduct.size : product.parameters.size,
      state: updateProduct.state
        ? updateProduct.state
        : product.parameters.state,
      brand: updateProduct.brand
        ? updateProduct.brand
        : product.parameters.brand,
      isUkraine: updateProduct.isUkraine
        ? updateProduct.isUkraine
        : product.parameters.isUkraine,
      color: allColor ? allColor : product.parameters.color,
    };

    await product.save();
    await this.cacheManager.del(id.toString());
    return product;
  }

  async getAllProducts(
    page: number,
    limit: number = 20,
  ): Promise<{ products: Product[]; totalItems: number; filters: any }> {
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
    const filters = await this.productFilterService.createFiltersData(products);
    const totalItems = await this.productModel.countDocuments().exec();

    return { products, totalItems, filters };
  }

  async getProduct(id: string) {
    const cacheProduct = await this.cacheManager.get(id);

    if (!cacheProduct) {
      const product = await this.findProductById(id);
      if (!product) {
        throw new BadRequestException('Щось пішло не так');
      }

      const allComment = await this.commentService.getAllFullCommentForProduct(
        product.id,
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

    if (!deleteProduct) {
      throw new BadRequestException('Такого товару не знайшов');
    }

    await this.cacheManager.del(id.toString());
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

  async filterAndSortedProducts(
    subCategoryOrCategory: string,
    sortField: string,
    sortOrder: string,
    filtersDto: FiltersDto,
    page: number,
    limit: number,
  ) {
    const startIndex = (page - 1) * limit;

    const sortOptions: { [key: string]: SortOrder } = sortField
      ? {
          [sortField === 'price' ? 'effectivePrice' : sortField]:
            sortOrder === 'asc' ? 1 : -1,
        }
      : {};

    const promiseCategory = this.categoryModel.findOne({
      'mainCategory.en': subCategoryOrCategory,
    });
    const promiseSubcategory = this.subCategoryModel.findOne({
      'subCategory.en': subCategoryOrCategory,
    });

    const [category, subcategory] = await Promise.all([
      promiseCategory,
      promiseSubcategory,
    ]);

    if (!category && !subcategory && subCategoryOrCategory !== 'all') {
      throw new BadRequestException(
        'Такої Категорії або підкатегорії не існує',
      );
    }
    const categoryId = category ? category.id : '';
    const subcategoryId = subcategory ? subcategory.id : '';

    if (filtersDto.price.min > filtersDto.price.max) {
      throw new BadRequestException('Мінімальна ціна  більше Максимальної');
    }

    const filterOptions =
      this.productFilterService.createObjectForFilteredProducts(
        subCategoryOrCategory,
        filtersDto,
        categoryId,
        subcategoryId,
      );

    const promiseAllProductsWithThisSubCategory = this.productModel
      .aggregate([
        {
          $match: {
            ...(subCategoryOrCategory === 'all'
              ? {}
              : {
                  $or: [
                    { category: categoryId },
                    { subCategory: subcategoryId },
                  ],
                }),
          },
        },
        ...aggregateForAllProductsInThisCategory,
      ])
      .exec();

    const promiseAllProductWithAllFiltersAndSorted = this.productModel
      .aggregate([
        ...addEffectivePrice,
        {
          $match: {
            ...filterOptions,
          },
        },
        ...aggregateForFiltersAndSortedProducts,
      ])
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limit)
      .exec();

    const [allProductsWithThisSubCategory, allProductWithAllFiltersAndSorted] =
      await Promise.all([
        promiseAllProductsWithThisSubCategory,
        promiseAllProductWithAllFiltersAndSorted,
      ]);

    const filters = await this.productFilterService.createFiltersData(
      allProductsWithThisSubCategory,
    );

    const totalDocuments =
      allProductsWithThisSubCategory.length > 0
        ? allProductsWithThisSubCategory.length
        : 0;

    return {
      products: allProductWithAllFiltersAndSorted,
      filters,
      totalItems: totalDocuments,
      totalPages: totalDocuments
        ? totalDocuments / limit < 1
          ? 1
          : Math.ceil(totalDocuments / limit)
        : 0,
    };
  }

  async getFewProducts(ids: string[]) {
    const favorites = await this.productModel
      .find({ _id: { $in: ids } })
      .select('-comments');
    return favorites;
  }

  async getProductByProducer(id: string) {
    const products = await this.productModel.find({ producer: id });

    return products;
  }

  async changeStatus(
    userId: string,
    productId: string,
    status: IStatusProduct,
  ) {
    const product = await this.productModel.findById(productId);
    const user = await this.userService.findOne(userId);
    if (!product && !user) {
      throw new BadRequestException(
        'Такий товар не знайдено або юзера не знайдено',
      );
    }
    const userProduct = user.id == product.producer;

    if (!userProduct) {
      throw new BadRequestException('Цей товар не ваш');
    }
    product.status = status;
    await product.save();

    return product;
  }
}
