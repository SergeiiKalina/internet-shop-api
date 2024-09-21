import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../product.model';
import { Model, Types } from 'mongoose';
import { FiltersDto } from '../dto/filters.dto';

@Injectable()
export class ProductFilterService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createFiltersData(products) {
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
      max: 0,
      min: products.length ? 9999 : 0,
    };

    products.forEach((el) => {
      if (el.discount) {
        if (el.discountPrice > price.max) {
          price.max = el.discountPrice;
        }
      } else {
        if (el.price > price.max) {
          price.max = el.price;
        }
      }
      if (el.discount) {
        if (el.discountPrice < price.min) {
          price.min = el.discountPrice;
        }
      } else {
        if (el.price < price.min) {
          price.min = el.price;
        }
      }
    });

    if (products.every((el) => el.category.en === 'forFree')) {
      price.max = 0;
      price.min = 0;
    }

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

  createObjectForFilteredProducts(
    subCategoryOrCategory: string,
    filtersDto: FiltersDto,
    categoryId: string,
    subcategoryId: string,
  ) {
    const filterPriceObj =
      filtersDto.discount.length === 0
        ? {
            effectivePrice: {
              $gte: filtersDto.price.min,
              $lte: filtersDto.price.max,
            },
          }
        : filtersDto.discount.length === 1 && filtersDto.discount[0] === false
          ? {
              price: {
                $gte: filtersDto.price.min,
                $lte: filtersDto.price.max,
              },
            }
          : {
              effectivePrice: {
                $gte: filtersDto.price.min,
                $lte: filtersDto.price.max,
              },
            };

    const filterOptions = {
      ...(subCategoryOrCategory === 'all'
        ? []
        : {
            $or: [
              { category: categoryId },
              { subCategory: subcategoryId || null },
            ],
          }),
      ...filterPriceObj,
      ...(filtersDto.sizes.length > 0
        ? { 'parameters.size': { $in: filtersDto.sizes } }
        : {}),
      ...(filtersDto.states.length > 0
        ? { 'parameters.state': { $in: filtersDto.states } }
        : {}),
      ...(filtersDto.eco.length > 0
        ? { 'parameters.eco': { $in: filtersDto.eco } }
        : {}),
      ...(filtersDto.isUkraine.length > 0
        ? { 'parameters.isUkraine': { $in: filtersDto.isUkraine } }
        : {}),
      ...(filtersDto.discount.length > 0
        ? { discount: { $in: filtersDto.discount } }
        : {}),
      ...(filtersDto.sex.length > 0
        ? { 'parameters.sex': { $in: filtersDto.sex } }
        : {}),
      ...(filtersDto.colors.length > 0
        ? {
            'parameters.color': {
              $in: filtersDto.colors.map(
                (colorId) => new Types.ObjectId(colorId),
              ),
            },
          }
        : {}),
    };
    if (filtersDto.colors.length > 0) {
      filterOptions['parameters.color'] = {
        $in: filtersDto.colors.map((colorId) => new Types.ObjectId(colorId)),
      };
    }
    return filterOptions;
  }
}
