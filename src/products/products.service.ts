import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.model';
import { Model } from 'mongoose';
import { ImageService } from './images-service/images.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/auth/auth.model';
import { Comment } from 'src/comment/comment.model';

const categoryDictionary = {
  подарункові_товари: {
    engName: 'gift',
    subcategories: {
      сувеніри: 'souvenirs',
      подарункові_набори: 'gift_sets',
      святкова_тематика: 'festive_theme',
    },
  },
  вишивка: {
    engName: 'embroidery',
    subcategories: {
      сорочки: 'shirts',
      плаття: 'dress',
      блузки: 'blouses',
    },
  },
  аксесуари: {
    engName: 'accessories',
    subcategories: {
      сумки: 'handbags',
      пояси: 'belts',
      портмоне: 'purse',
      хустки: 'handkerchiefs',
      окуляри: 'glass',
    },
  },
  взуття_з_натуральних_матеріалів: {
    engName: 'eco',
    subcategories: {
      зимове: 'winter',
      літнє: 'summer',
    },
  },
  натуральна_косметика: {
    engName: 'natural_cosmetics',
    subcategories: {
      мило: 'soap',
      парфюмерія: 'perfumery',
    },
  },
  товари_з_перероблених_матеріалів: {
    engName: 'recycled_materials',
    subcategories: {
      перероблений_денім: 'recycled_denim',
      востановленний_секонд_хэнд: 'second_hand',
    },
  },
  'подарую+віддам': { engName: 'for_free' },
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly imageService: ImageService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    id: string,
  ) {
    const image = await this.imageService.uploadPhoto(file);

    if (!image) {
      throw new BadRequestException(
        'Something is wrong with the image loading',
      );
    }

    const engNamesCategories = await this.createEngNameForCategories(
      createProductDto.category,
      createProductDto.subCategory,
    );

    const { color, size, state, brand, eco, ...restProduct } = createProductDto;

    const product = await this.productModel.create({
      ...restProduct,
      ...engNamesCategories,
      img: image.data.url,
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
  async delete(id: number) {
    const deleteProduct = this.productModel.findByIdAndDelete(id);

    return deleteProduct;
  }

  async createEngNameForCategories(
    nameCategory: string,
    nameSubcategory: string,
  ) {
    const category =
      categoryDictionary[
        nameCategory.charAt(0).toLowerCase() +
          nameCategory.split(' ').join('_').slice(1)
      ];
    const engCategory =
      categoryDictionary[
        nameCategory.charAt(0).toLowerCase() +
          nameCategory.split(' ').join('_').slice(1)
      ].engName;

    const engSubcategory =
      category.subcategories[
        nameSubcategory.charAt(0).toLowerCase() +
          nameSubcategory.split(' ').join('_').slice(1)
      ];

    return { engCategory, engSubcategory };
  }
}
