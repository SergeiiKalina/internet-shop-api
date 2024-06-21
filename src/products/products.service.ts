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
import { Size } from 'src/size/size.model';
import { TransformImageService } from './images-service/transform-image.sevice';
import axios from 'axios';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Size.name) private sizeModel: Model<Size>,
    private readonly imageService: ImageService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly categoryService: CategoryService,
    private readonly colorService: ColorService,
    private readonly transformImageService: TransformImageService,
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
    const circle = await this.transformImageService.transform(files[0]);

    const minImage = await this.imageService.uploadPhoto(circle);
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
      minImage,
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
      .populate('category', '-subCategory -img ')
      .populate('subCategory', '-sizeChart -color -mainCategory -img ')
      .populate('parameters.color')
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
    const subCategory = await this.categoryService.getSubCategoryById(
      product.subCategory,
    );
    const { color, size, state, ...restParameters } = restProduct.parameters;

    return {
      ...restProduct,
      parameters: restParameters,
      subCategory,
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

    const filters = {};
    if (nameSubCategory.color) {
      const colors = await this.colorService.getAllColors();

      filters['colors'] = colors;
    }
    if (nameSubCategory.sizeChart && nameSubCategory.sizeChart.length > 0) {
      const sizeChart = await this.sizeModel.findById(
        nameSubCategory.sizeChart[0],
      );
      const { subCategory, ...restSubcategory } = sizeChart.toObject();

      filters['sizeChart'] = restSubcategory;
    }

    return { products: allProductWithThisSubCategory, filters };
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

  // async changeAllCategory(file: Express.Multer.File) {
  //   const products = await this.productModel.find().exec();
  //   for (let i = 0; i < products.length; i++) {
  //     const responce = await axios.get(products[i].img[0], {
  //       responseType: 'arraybuffer',
  //     });
  //     const circle = await this.transformImageService.transform(responce.data);
  //     const formData = new FormData();
  //     formData.append(
  //       'image',
  //       new Blob([circle.buffer], { type: 'image/png' }),
  //       Date.now() + '-' + Math.round(Math.random() * 1e9),
  //     );
  //     const { data } = await axios.post(
  //       'https://api.imgbb.com/1/upload',
  //       formData,
  //       {
  //         params: {
  //           key: '401f89dfe6ab448e7a936805f8cc22af',
  //         },
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       },
  //     );
  //     products[i].minImage = data.data.url;
  //     await products[i].save();
  //   }
  // }
}
