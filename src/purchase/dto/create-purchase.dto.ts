import { IsOptional, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  city: string;
  @IsString()
  postOffice: string;
  @IsString()
  tel: string;
  @IsString()
  wayDelivery: string;
  @IsString()
  pay: string;
  @IsString()
  @IsOptional()
  building?: string;
}
