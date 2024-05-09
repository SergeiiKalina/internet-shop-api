import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  email: string;
}
