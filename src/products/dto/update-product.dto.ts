import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    type: Number,
    description: 'Product id',
  })
  @IsString()
  productId: string;
}
