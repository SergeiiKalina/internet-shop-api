import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';
import { ImageService } from './images-service/images.service';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
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

    const product = await this.productModel.create({
      ...{ ...createProductDto },
      img: image.data.url,
      producer: id,
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

  async getAllProducts(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async getProduct(id: number) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new BadRequestException('Something is wrong');
    }
    return product;
  }
  async delete(id: number) {
    const deleteProduct = this.productModel.findByIdAndDelete(id);

    return deleteProduct;
  }
}
