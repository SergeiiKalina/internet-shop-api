import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';
import { statusProduct } from '../enum/enumForProducts';

export class ChangeProductStatusDto {
  @ApiProperty({
    description: 'Status Product',
    default: { enable: 'Активне' },
    type: Object,
    enum: statusProduct,
  })
  @IsEnum(statusProduct, {
    message: `status can be  ${JSON.stringify(statusProduct)}`,
  })
  @IsObject()
  status: { [key: string]: string };
}
