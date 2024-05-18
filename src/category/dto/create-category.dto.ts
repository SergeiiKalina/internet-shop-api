import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class CreateCategoryDto {
  // @ApiProperty({ type: Object, description: 'Main category on eng and ua' })
  @IsObject()
  mainCategory: Record<string, object>;

  // @ApiProperty({ type: Object, description: 'subCategory on eng and ua' })
  @IsObject()
  subCategory: Record<string, object>;
}
