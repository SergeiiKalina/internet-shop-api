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
import {
  CategoryEnum,
  sexEnum,
  sizeEmbroidery,
  SubCategoryEnum,
} from '../enum/enumForProducts';

export class CreateProductDto {
  constructor() {}
  @ApiProperty({ type: String, description: 'Title of the product' })
  @IsString()
  @Length(3, 100)
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
  @IsEnum(sizeEmbroidery, {
    each: true,
    message: `Each value in size must be one of the following values: (${sizeEmbroidery.map((el) => el + ' ')})`,
  })
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
  @ApiProperty({ type: String, description: '' })
  @IsString()
  @IsOptional()
  @IsEnum(sexEnum, {
    message: `sex not correct, must be (${sexEnum.map((el) => ' ' + el)})`,
  })
  sex?: string;
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
