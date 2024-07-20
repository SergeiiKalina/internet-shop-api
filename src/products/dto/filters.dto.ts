import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsString } from 'class-validator';

interface IPrice {
  max: number;
  min: number;
}

export class FiltersDto {
  @ApiProperty({
    type: {
      max: { type: Number },
      min: { type: Number },
    },
    description: 'price range',
  })
  @IsObject()
  price: IPrice;
  @ApiProperty({
    type: [String],
    description: 'array Id of colors',
  })
  @IsArray()
  colors: string[];
  @ApiProperty({
    type: [String],
    description: 'array of sizes',
  })
  @IsArray()
  sizes: string[];
  @ApiProperty({
    type: [String],
    description: 'array of states',
  })
  @IsArray()
  states: string[];
  @ApiProperty({
    type: [String],
    description: 'array of brands',
  })
  @IsArray()
  brands: string[];
  @ApiProperty({
    type: [Boolean],
    description: 'array of booleans',
  })
  @IsArray()
  eco: boolean[];
  @ApiProperty({
    type: [Boolean],
    description: 'array of booleans',
  })
  @IsArray()
  isUkraine: boolean[];
  @IsArray()
  @ApiProperty({
    type: [Boolean],
    description: 'array of booleans',
  })
  discount: boolean[]
  @ApiProperty({
    type: [String],
    description: 'array of String',
  })
  @IsArray()
  @IsString({each:true})
  sex: string[]
}
