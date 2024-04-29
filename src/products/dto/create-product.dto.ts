import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ type: String, description: 'Title of the product' })
  @IsString()
  title: string;
  @ApiProperty({ type: String, description: 'Price of the product' })
  @IsString()
  price: string;
  @ApiProperty({
    type: String,
    description: 'Whether the product is eco-friendly',
  })
  @IsString()
  @IsIn(['on', 'off'])
  eco: string;
  @ApiProperty({
    type: String,
    description: 'Whether the product has discount',
  })
  @IsIn(['on', 'off'])
  @IsString()
  discount: string;
  @ApiProperty({
    type: String,
    description: 'Description of the discount item',
  })
  @IsString()
  discountItem: string;
  @IsDate()
  createDate?: Date = new Date();
  @IsNumber()
  visit?: number;
  @ApiProperty({
    type: [String],
    description: 'Array of categories for the product',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  category: string[];
  @ApiProperty({ description: 'Subcategory of the product', type: String })
  @IsString()
  @IsOptional()
  subCategory?: string;
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file of the product',
  })
  @IsString()
  @IsOptional()
  img?: string;
}
