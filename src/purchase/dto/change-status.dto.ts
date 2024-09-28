import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export const statusPurchase = [
  'Виконано',
  'Очікується відправка',
  'Скасовано',
] as const;

export default class ChangeStatusDto {
  @ApiProperty({
    description: `Status must be only (${statusPurchase.map((el) => ' ' + el)})`,
    type: String,
    enum: statusPurchase,
    default: 'Очікується відправка',
  })
  @IsString()
  @IsEnum(statusPurchase, {
    message: `Статус повинен бути тільки один з цих (${statusPurchase.map((el) => ' ' + el)})`,
  })
  status: string;
}
