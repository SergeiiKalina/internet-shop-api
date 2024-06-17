import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';

const CategoryEnum = [
  'Подарункові товари',
  'Вишивка',
  'Аксесуари',
  'Взуття з натуральних матеріалів',
  'Натуральна косметика',
  'Товари з перероблених матеріалів',
  'Подарую+віддам',
] as const;

const SubCategoryEnum = [
  'Сувеніри',
  'Подарункові набори',
  'Святкова тематика',
  'Сорочки',
  'Плаття',
  'Блузки',
  'Сумки',
  'Пояси',
  'Портмоне',
  'Хустки',
  'Окуляри',
  'Зимове',
  'Літнє',
  'Мило',
  'Парфюмерія',
  'Перероблений денім',
  'Востановленний секонд хэнд',
] as const;

const sizeEmbroidery = [
  'Без розміру',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'EU 36',
  'EU 37',
  'EU 38',
  'EU 39',
  'EU 40',
  'EU 41',
  'EU 42',
  'EU 43',
  'EU 44',
  'EU 45',
] as const;

export class CreateProductDto {
  constructor() {}
  @ApiProperty({ type: String, description: 'Title of the product' })
  @IsString()
  title: string;

  @ApiProperty({ type: Number, description: 'Price of the product' })
  @IsNumber()
  price: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the product has discount',
  })
  @IsBoolean()
  discount: boolean;
  @ApiProperty({
    description: 'Flag indicating if the product is eco-friendly',
    type: Boolean,
  })
  @IsBoolean()
  eco: boolean;

  @ApiProperty({
    type: Number,
    description: 'Description of the discount item',
  })
  @IsNumber()
  discountPrice: number;

  @ApiProperty({
    description: `Category of the product only(${CategoryEnum.map((el) => ' ' + el)})`,
    type: String,
    enum: CategoryEnum,
    default: 'Подарункові товари',
  })
  @IsString()
  @IsEnum(CategoryEnum, { message: 'Category not correct' })
  category: string;

  @ApiProperty({
    description: `Subcategory of the product only (${SubCategoryEnum.map((el) => ' ' + el)})`,
    type: String,
    enum: SubCategoryEnum,
    default: 'Сувеніри',
  })
  @IsString()
  @IsEnum(SubCategoryEnum, { message: 'Subcategory not correct' })
  subCategory: string;

  @ApiProperty({
    description: 'State of the product',
    default: 'Нове',
    type: String,
    enum: ['Нове', 'Уживаний товар'],
  })
  @IsString()
  @IsEnum(['Нове', 'Уживаний товар'], { message: 'Subcategory not correct' })
  state: string;
  @ApiProperty({
    type: [String],
    description: 'Size of the product',
    default: ['Без розміру'],
  })
  @IsArray()
  @IsString()
  @IsEnum(sizeEmbroidery)
  size: string;

  @ApiProperty({ description: 'Color of the product', type: [String] })
  @IsArray()
  @IsString()
  color?: string;

  @ApiProperty({ type: String, description: 'Brand of the product' })
  @IsString()
  brand?: string;
  @ApiProperty({ type: String, description: 'Description of the product' })
  @IsString()
  describe: string;
  @ApiProperty({ type: Boolean, description: 'Made in Ukraine or not' })
  @IsBoolean()
  isUkraine: boolean;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Array of product images',
  })
  file: any[];
}
