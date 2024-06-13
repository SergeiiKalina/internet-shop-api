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
import { User } from 'src/auth/user.model';
import { Comment } from 'src/comment/comment.model';
import { Category } from 'src/category/categoty.model';
import { SubCategory } from 'src/category/subCategory.model';
import { Color } from 'src/color/color.model';
import { CommentService } from 'src/comment/comment.service';
import { UserService } from 'src/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Color.name) private colorModel: Model<Color>,
    private readonly imageService: ImageService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const arrayLinkImages = [];
    for (let i = 0; i < files.length; i++) {
      const image = await this.imageService.uploadPhoto(files[i]);
      if (!image) {
        throw new BadRequestException(
          'Щось сталось не так з завантаженням кртинки',
        );
      }
      arrayLinkImages.push(image.data.url);
    }
    const category = await this.categoryModel.findOne({
      'mainCategory.ua': createProductDto.category,
    });

    const subCategory = await this.subCategoryModel.findOne({
      'subCategory.ua': createProductDto.subCategory,
    });

    const { color, size, state, brand, eco, isUkraine, ...restProduct } =
      createProductDto;

    const allColor = await this.colorModel.find({
      colorName: { $in: color },
    });

    if (!allColor) {
      throw new BadRequestException(
        'Не коректний колір він повинен бути з списку (Білий, Чорний, Сірий, Бежевий,  Червоний, Жовтий, Помаранчевий, Синій, Блакитний, Рожевий, Зелений, Фіолетовий, Золотий, Сріблястий ) або "Без кольору"',
      );
    }

    const product = await this.productModel.create({
      ...restProduct,
      category: category.mainCategory,
      subCategory: subCategory.subCategory,
      img: arrayLinkImages,
      producer: id,
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
      return new BadRequestException('Цей продукт не знайдено');
    }

    for (const key in updateProduct) {
      product[key] = updateProduct[key];
    }

    const arrayLinkImages = [];
    for (let i = 0; i < files.length; i++) {
      const image = await this.imageService.uploadPhoto(files[i]);
      if (!image) {
        throw new BadRequestException(
          'Щось сталось не так з завантаженням кртинки',
        );
      }
      arrayLinkImages.push(image.data.url);
    }
    const category = await this.categoryModel.findOne({
      'mainCategory.ua': updateProduct.category,
    });

    const subCategory = await this.subCategoryModel.findOne({
      'subCategory.ua': updateProduct.subCategory,
    });

    product.img = arrayLinkImages;
    product.producer = userId;
    product.category = category.mainCategory;
    product.subCategory = subCategory.subCategory;

    await product.save();

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
    const product = await this.productModel.findById(id);
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

      product.visit = product.visit + 1;

      await this.cacheManager.set(
        id.toString(),
        {
          ...product.toObject(),
          producer: user[0],
          comments: allComment,
        },
        1000 * 60 * 60,
      );

      await product.save();

      return {
        ...product.toObject(),
        producer: user[0],
        comments: allComment,
      };
    }

    return cacheProduct;
  }
  async delete(id: string) {
    const deleteProduct = this.productModel.findByIdAndDelete(id);

    return deleteProduct;
  }

  async findProductById(id: string) {
    return await this.productModel.findById(id);
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
        'subCategory.ua': nameSubCategory.subCategory.ua,
      })
      .exec();
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
        'category.ua': nameCategory.mainCategory.ua,
      })
      .exec();
    return allProductWithThisCategory;
  }
}
