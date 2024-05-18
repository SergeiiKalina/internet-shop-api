import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  // @ApiProperty({ type: String, description: 'Main category ref' })
  @IsString()
  mainCategory: string;

  // @ApiProperty({ type: Object, description: 'subCategory on eng and ua' })
  @IsObject()
  subCategory: Record<string, object>;
}
