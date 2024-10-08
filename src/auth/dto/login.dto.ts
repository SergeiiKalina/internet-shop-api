import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @Length(10, 50)
  @IsString()
  @Matches(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, {
    message: 'Email повинен мати латиньскі літери і спец символи  (. _  + -)',
  })
  email: string;

  @IsString()
  @Length(6, 20)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()^{}#+._=;:'",<>`\/\[\]])[A-Za-z\d@$!%*?&()^{}#+._=;:'`",<>\/\[\]]{6,}$/,
    {
      message: 'Пароль містить недопустимі символи',
    },
  )
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Password (6-20 characters, must contain at least 1 special character and 1 uppercase letter)',
  })
  password: string;
}
