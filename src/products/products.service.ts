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
import { UserService } from 'src/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CategoryService } from 'src/category/category.service';
import { ColorService } from 'src/color/color.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    private readonly imageService: ImageService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly categoryService: CategoryService,
    private readonly colorService: ColorService,
  ) {}

  async searchProducts(title: string): Promise<Product[]> {
    const regex = new RegExp(`^${title}`, 'i'); // Case-insensitive search for names starting with 'firstLetter'
    return this.productModel.find({ title: regex }).exec();
  }

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    id: string,
  ) {
    const images = await this.imageService.uploadPhotos(files);
    const categoryId = await this.categoryService.findCategoryByName(
      createProductDto.category,
    );
    const subCategoryId = await this.categoryService.findSubcategoryByName(
      createProductDto.subCategory,
    );

    const { color, size, state, brand, eco, isUkraine, ...restProduct } =
      createProductDto;

    const allColor = await this.colorService.getColorsByName(
      color.split(',').map((el) => el.toLocaleLowerCase()),
    );

    const product = await this.productModel.create({
      ...restProduct,
      category: categoryId,
      subCategory: subCategoryId,
      img: images,
      producer: id,
      parameters: {
        color: allColor,
        size: size.split(','),
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
      updateProduct.color.split(',').map((el) => el.toLocaleLowerCase()),
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
      .skip(startIndex)
      .limit(limit)
      .exec();

    const totalItems = await this.productModel.countDocuments().exec();

    return { products, totalItems };
  }

  async getProduct(id: string) {
    const product = await this.findProductById(id);
    const cacheProduct = await this.cacheManager.get(id);

    if (!cacheProduct) {
      if (!product) {
        throw new BadRequestException('Щось пішло не так');
      }

      const user = await this.userService.getUserWithNeedFields(
        product.producer,
        ['_id', 'email', 'firstName', 'lastName', 'numberPhone', 'rating'],
      );

      const allComment = await this.commentService.getAllFullCommentForProduct(
        product.comments,
      );

      const category = await this.categoryService.getCategoryById(
        product.category,
      );
      const subCategory = await this.categoryService.getSubCategoryById(
        product.subCategory,
      );

      const colors = await this.colorService.getColorsByIds(
        product.parameters.color,
      );

      product.visit = product.visit + 1;

      const returnProduct = {
        ...product.toObject(),
        category,
        subCategory,
        producer: user[0],
        comments: allComment,
        parameters: {
          ...product.toObject().parameters,
          color: colors,
        },
      };

      await this.cacheManager.set(id.toString(), returnProduct, 1000 * 60 * 3);

      await product.save();

      return returnProduct;
    } else {
      product.visit = product.visit + 1;
      await product.save();
      return cacheProduct;
    }
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
    const product = await this.productModel.findById(id);
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
    const allProductWithThisSubCategory = await this.productModel.find({
      subCategory: nameSubCategory.id,
    });

    return allProductWithThisSubCategory;
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
        category: nameCategory.id,
      })
      .exec();
    return allProductWithThisCategory;
  }

  // async changeAllCategory() {
  //   const products = await this.productModel.find().exec();

  //   for (let i = 0; i < products.length; i++) {
  //     for (let j = 0; j < products[i].parameters.color.length; j++) {
  //       if (Types.ObjectId.isValid(products[i].parameters.color[j])) {
  //         console.log(products[i].title, products[i].parameters.color);
  //       }
  //     }
  //   }
  // }
}
