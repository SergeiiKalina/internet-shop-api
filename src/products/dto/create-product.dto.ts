import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

const CategoryEnum = [
  'Подарункові товари',
  'Одяг',
  'Аксесуари',
  'Взуття з натуральних матеріалів',
  'Натуральна косметика',
  'Товари з перероблених матеріалів',
  'Подарую',
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
  'Вишивка',
  null,
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
  @Length(3, 50)
  title: string;

  @ApiProperty({ type: Number, description: 'Price of the product' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  price: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the product has discount',
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value === 'false' ? false : true))
  discount: boolean;
  @ApiProperty({
    description: 'Flag indicating if the product is eco-friendly',
    type: Boolean,
  })
  @IsBoolean()
  @Transform(({ value }) => (value === 'false' ? false : true))
  eco: boolean;

  @ApiProperty({
    type: Number,
    description: 'Description of the discount item',
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
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
  @IsOptional()
  @IsEnum(SubCategoryEnum, { message: 'Subcategory not correct' })
  subCategory: string | null;

  @ApiProperty({
    description: 'State of the product',
    default: 'Нове',
    type: String,
    enum: ['Нове', 'Уживаний товар'],
  })
  @IsString()
  @IsEnum(['Нове', 'Уживаний товар'], { message: 'state not correct' })
  state: string;
  @ApiProperty({
    type: [String],
    description: 'Size of the product',
    default: ['Без розміру'],
  })
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((item) => item.trim())
      : value,
  )
  @IsEnum(sizeEmbroidery, { each: true })
  size: string[];

  @ApiProperty({ description: 'Color of the product', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((item) => item.trim().toLowerCase())
      : value,
  )
  color?: string[];

  @ApiProperty({ type: String, description: 'Brand of the product' })
  @IsString()
  @IsOptional()
  brand?: string;
  @ApiProperty({ type: String, description: 'Description of the product' })
  @IsString()
  @MinLength(30)
  describe: string;
  @ApiProperty({ type: Boolean, description: 'Made in Ukraine or not' })
  @IsBoolean()
  @Transform(({ value }) => (value === 'false' ? false : true))
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
