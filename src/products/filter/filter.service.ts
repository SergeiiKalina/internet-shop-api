import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../product.model';
import { Model } from 'mongoose';

@Injectable()
export class ProductFilterService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createFiltersData(products: Product[]) {
    const colors = await this.getUniqueValues(products, 'color');
    const sizes = await this.getUniqueValues(products, 'size');
    const states = await this.getUniqueValues(products, 'state');
    const brands = await this.getUniqueValues(products, 'brand');
    const sex = await this.getUniqueValues(products, 'sex');
    const eco = [
      ...new Set(
        products
          .map((product) => product.parameters.eco)
          .filter((value) => value !== null && value !== undefined),
      ),
    ];
    const madeInUkraine = [
      ...new Set(
        products
          .map((product) => product.parameters.isUkraine)
          .filter((value) => value !== null && value !== undefined),
      ),
    ];

    const price = {
      max: products.length ? Number.MIN_VALUE : 0,
      min: products.length ? Number.MAX_VALUE : 0,
    };

    products.forEach((el) => {
      if (el.price > price.max) {
        if(el.discount){
          price.max = el.discountPrice
        }else{
          price.max = el.price;
        }
      }
      if (el.price < price.min) {
        if(el.discount){
          price.min = el.discountPrice
        }else{
          price.min = el.price;
        }
      }
    });

    return {
      price,
      colors,
      sizes,
      states,
      brands,
      eco,
      madeInUkraine,
      sex,
    };
  }
  async getUniqueValues(products, key) {
    const values = products.flatMap((product) => product.parameters[key]);

    if (key === 'color') {
      const colorMap = new Map();
      values.forEach((colorObj) => {
        if (colorObj && !colorMap.has(colorObj.colorName)) {
          colorMap.set(colorObj.colorName, colorObj);
        }
      });

      return Array.from(colorMap.values());
    } else if (key === 'size') {
      return [
        ...new Set(
          values.filter(
            (size) => size !== '' && size !== null && size !== undefined,
          ),
        ),
      ];
    } else if (key === 'brand') {
      return [
        ...new Set(
          values.filter(
            (brand) =>
              brand !== '' &&
              brand !== '-' &&
              brand !== null &&
              brand !== undefined,
          ),
        ),
      ];
    } else if (key === 'sex') {
      return [
        ...new Set(
          values.filter(
            (sex: string) =>
              sex !== '' && sex !== '-' && sex !== null && sex !== undefined,
          ),
        ),
      ];
    } else {
      return [
        ...new Set(
          values.filter((value) => value !== null && value !== undefined),
        ),
      ];
    }
  }
}
