import {
  BadRequestException,
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    private readonly imageService: ImageService,
  ) {}

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
          'Something is wrong with the image loading',
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

    const { color, size, state, brand, eco, ...restProduct } = createProductDto;

    const product = await this.productModel.create({
      ...restProduct,
      category: category.mainCategory,
      subCategory: subCategory.subCategory,
      img: arrayLinkImages,
      producer: id,
      parameters: {
        color,
        size,
        state,
        brand,
        eco,
      },
    });

    if (!product) {
      throw new BadRequestException(
        'Something is wrong with the create products',
      );
    }

    return product;
  }

  async updateProduct(
    updateProduct: UpdateProductDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const { productId, ...rest } = updateProduct;
    let product = await this.productModel.findById(productId);
    if (!product) {
      return new BadRequestException('This product not found');
    }

    for (const key in rest) {
      product[key] = rest[key];
    }

    const image = await this.imageService.uploadPhoto(file);
    if (!image) {
      throw new BadRequestException(
        'Something is wrong with the image loading',
      );
    }

    product.img = image.data.url;
    product.producer = userId;

    await product.save();

    return product;
  }

  async getAllProducts(page: number, limit: number): Promise<Product[]> {
    const startIndex = (page - 1) * limit;

    const paginatedProducts = await this.productModel
      .find()
      .skip(startIndex)
      .limit(limit)
      .exec();

    const endIndex = page * limit;
    const paginatedPosts = paginatedProducts.slice(startIndex, endIndex);
    return paginatedPosts;
  }

  async getProduct(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new BadRequestException('Something is wrong');
    }
    const user = await this.userModel.findById(product.producer);

    if (!user) {
      throw new BadRequestException('Something is wrong');
    }
    const { password, ...userWithoutPass } = user.toObject();
    let arrComments = [];
    let updatedComments = [];
    for (let i = 0; i < product.comments.length; i++) {
      let comment = await this.commentModel.findById(product.comments[i]);
      if (!comment) {
        continue;
      }
      const author = await this.userModel.findById(comment.author);
      const { password, ...authorWithoutPass } = author.toObject();
      arrComments.push({ ...comment.toObject(), author: authorWithoutPass });
      updatedComments.push(comment._id);
    }

    product.comments = updatedComments;

    await product.save();

    return {
      ...product.toObject(),
      producer: userWithoutPass,
      comments: arrComments,
    };
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
      throw new NotFoundException('this subcategory not found');
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
      throw new NotFoundException('this category not found');
    }
    const allProductWithThisCategory = await this.productModel
      .find({
        'category.ua': nameCategory.mainCategory.ua,
      })
      .exec();
    return allProductWithThisCategory;
  }
}
