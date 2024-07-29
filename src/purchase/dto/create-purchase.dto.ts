import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  @ApiProperty({
    description: 'First name of user',
    type: String,
    required: true,
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-]+$/, {
    message:
      "Ім'я повинне мати латиські або кирилічні символи а довжина від 2 до 20 символів",
  })
  @Length(2, 20)
  firstName: string;
  @IsString()
  @ApiProperty({
    description: 'Last name of user',
    type: String,
    required: true,
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-]+$/, {
    message:
      'Прізвище повинне мати латиські або кирилічні символи а довжина від 2 до 20 символів',
  })
  @Length(2, 20)
  lastName: string;
  @ApiProperty({
    description: 'User email',
    type: String,
    required: false,
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  @Length(10, 50)
  @Matches(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, {
    message: 'Email повинен мати латиньскі літери і спец символи  (. _  + -)',
  })
  email?: string;
  @IsString()
  @ApiProperty({
    description: 'User city',
    type: String,
    required: true,
  })
  @Length(3, 20)
  city: string;
  @IsString()
  @ApiProperty({
    description: 'Number post office',
    type: String,
    required: true,
  })
  postOffice: string;
  @IsString()
  @ApiProperty({
    description: 'Number phone',
    type: String,
    required: true,
  })
  @Matches(/^\s*\+38\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*$/, {
    message: 'Номер телефону повинен посинатись з "+38" і мати 10 цифр',
  })
  @IsNotEmpty()
  tel: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User ID, if any',
    type: String,
    required: false,
  })
  userId?: string;
  @IsString()
  @ApiProperty({
    description: 'delivery method',
    type: String,
    required: true,
  })
  wayDelivery: string;
  @IsString()
  @ApiProperty({
    description: 'How user will pay',
    type: String,
    required: true,
  })
  pay: string;
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'delivery address',
    type: String,
    required: true,
  })
  building?: string;
  @IsNumber()
  @ApiProperty({
    description: 'Quantity products',
    type: Number,
    required: true,
  })
  @Min(1)
  quantity: number;
}
