import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.model';
import { Model } from 'mongoose';
import { ImageService } from './images-service/images.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly imageService: ImageService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
    id,
  ) {
    const image = await this.imageService.uploadPhoto(file);
    if (!image) {
      throw new BadRequestException(
        'Something is wrong with the image loading',
      );
    }
    const eco: boolean = createProductDto.eco === 'on';
    const discount: boolean = createProductDto.discount === 'on';
    const product = await this.productModel.create({
      ...{ ...createProductDto, eco, discount },
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

  async getAllProducts(): Promise<Product[]> {
    return this.productModel.find().exec();
  }
}
