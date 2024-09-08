import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @Matches(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, {
    message: 'Будь ласка, введіть коректну електронну адресу',
  })
  @IsEmail()
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  email: string;
}
