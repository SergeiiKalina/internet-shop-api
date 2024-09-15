import {
  IsEmail,
  IsString,
  Length,
  Matches,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Email address must contain only Latin characters and this symbol (. _  + -)',
  })
  @Length(10, 50)
  @Matches(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, {
    message: 'Email повинен мати латиньскі літери і спец символи  (. _  + -)',
  })
  email: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @ApiProperty({
    description:
      'First name (2-20 characters) and must contain only Cyrillic, Latin characters, and dashes.',
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-']+$/, {
    message:
      " Ім'я може містити тільки літери латинського або кириличного алфавіту",
  })
  firstName: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Last name (2-20 characters) and must contain only Cyrillic, Latin characters, and dashes.',
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-']+$/, {
    message:
      'Прiзвище може містити тільки літери латинського або кириличного алфавіту',
  })
  lastName: string;

  @IsString()
  @Matches(/^\s*\+38\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*$/, {
    message: 'Номер телефону повинен посинатись з "+38" і мати 10 цифр',
  })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Phone number (+38XXXXXXXXXX)',
  })
  numberPhone: string;

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

  @IsOptional()
  @IsBoolean()
  isActivated?: boolean;
}
