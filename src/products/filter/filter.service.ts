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
    const eco = [...new Set(products.map((product) => product.parameters.eco))];
    const madeInUkraine = [
      ...new Set(products.map((product) => product.parameters.isUkraine)),
    ];
    const price = {
      max: products.length ? 0 : Number.MIN_VALUE,
      min: products.length ? 0 : Number.MAX_VALUE,
    };

    products.forEach((el) => {
      if (el.price > price.max) {
        price.max = el.price;
      }
      if (el.price < price.min) {
        price.min = el.price;
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
    };
  }
  async getUniqueValues(products, key) {
    const values = products.flatMap((product) => product.parameters[key]);

    if (key === 'color') {
      const colorMap = new Map();
      values.forEach((colorObj) => {
        if (!colorMap.has(colorObj.colorName)) {
          colorMap.set(colorObj.colorName, colorObj);
        }
      });
      return Array.from(colorMap.values());
    } else if (key === 'size') {
      return [...new Set(values.filter((size) => size !== ''))];
    } else if (key === 'brand') {
      return [
        ...new Set(values.filter((brand) => brand !== '' && brand !== '-')),
      ];
    } else {
      return [...new Set(values)];
    }
  }
}
