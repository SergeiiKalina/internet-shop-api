import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    description: 'Name category in English on lower case',
  })
  @IsString()
  en: string;
  @ApiProperty({
    type: String,
    description:
      'Name the category in Ukrainian: the first character is uppercase, and the others are lowercase',
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
