import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({ type: String, description: 'Main category Id' })
  @IsString()
  mainCategory: string;

  @ApiProperty({
    type: String,
    description: 'Name subcategory in English on lower case',
  })
  @IsString()
  en: string;
  @ApiProperty({
    type: String,
    description:
      'Name the subcategory in Ukrainian: the first character is uppercase, and the others are lowercase',
  })
  @IsString()
  ua: string;
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Product category image file',
  })
  file: any;
}
