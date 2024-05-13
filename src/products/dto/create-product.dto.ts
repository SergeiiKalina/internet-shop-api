import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
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
  price: number;
  @ApiProperty({
    type: Boolean,
    description: 'Whether the product is eco-friendly',
  })
  @IsBoolean()
  eco: boolean;
  @ApiProperty({
    type: Boolean,
    description: 'Whether the product has discount',
  })
  @IsBoolean()
  discount: boolean;
  @ApiProperty({
    type: String,
    description: 'Description of the discount item',
  })
  @IsString()
  discountPrice: number;
  @IsDate()
  createDate?: Date = new Date();
  @IsNumber()
  visit?: number;
  @ApiProperty({
    type: [String],
    description: 'Array of categories for the product',
  })
  @IsString({ each: true })
  // @IsArray()
  @IsOptional()
  category: string;
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
  @IsString()
  state?: string;
  @IsString()
  size?: string;
  @IsString()
  describe?: string;
}
