import { IsArray, IsString } from 'class-validator';

export class CreateSizeDto {
  @IsArray()
  sizeChart: string;
  @IsString()
  subCategory: string;
}
