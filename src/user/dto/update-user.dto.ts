import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export const sexEnum = ['male', 'female'] as const;

export class UpdateUserDto {
  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    description:
      "Ім'я може містити тільки літери латинського або кириличного алфавіту",
    required: false,
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-']+$/, {
    message:
      "Ім'я може містити тільки літери латинського або кириличного алфавіту",
  })
  firstName?: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    description:
      'Прiзвище може містити тільки літери латинського або кириличного алфавіту',
    required: false,
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-']+$/, {
    message:
      'Прiзвище може містити тільки літери латинського або кириличного алфавіту',
  })
  lastName?: string;

  @IsString()
  @Length(2, 20)
  @IsOptional()
  @ApiProperty({
    description:
      'Sur name (2-20 characters) and must contain only Cyrillic, Latin characters, and dashes.',
    required: false,
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-']+$/, {
    message:
      'По батькові повинне мати латиські або кирилічні символи а довжина від 2 до 20 символів',
  })
  surName?: string;

  @ApiProperty({
    type: String,
    description: `Can be only ${sexEnum.map((el) => el)}`,
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsEnum(sexEnum, {
    message: `Стать має бути тільки ${sexEnum.map((el) => el)}`,
  })
  gender?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description:
      'Email address must contain only Latin characters and this symbol (. _  + -)',
    required: false,
  })
  @Length(10, 50)
  @Matches(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, {
    message: 'Email повинен мати латиньскі літери і спец символи  (. _  + -)',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\s*\+38\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*$/, {
    message: 'Номер телефону повинен посинатись з "+38" і мати 10 цифр',
  })
  @ApiProperty({
    description: 'Phone number (+38XXXXXXXXXX)',
    required: false,
  })
  numberPhone?: string;

  @IsString()
  @Length(6, 20)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()^{}#+._=;:'",<>/])[A-Za-z\d@$!%*?&()^{}#+._=;:'",<>/]{6,}$/,
    {
      message:
        'Пароль повинен бути 6-20 символів: літери, цифри, і один спеціальний символ і одна велика літера.(@$!%*?&()^{}#+._=;:\'",<>/)',
    },
  )
  @IsOptional()
  @ApiProperty({
    description:
      'Password (6-20 characters, must contain at least 1 special character (@$!%*?&()^{}#+._=;:\'",<>/) and 1 uppercase letter)',
    required: false,
  })
  password?: string;
  @ApiProperty({
    description: 'Дата народження користувача',
    example: '1990-01-01',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'Дата народження має бути дійсною датою у форматі YYYY-MM-DD' },
  )
  birthDate?: string;

  @ApiProperty({
    type: 'Picture',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Profile pictures',
    required: false,
  })
  @IsOptional()
  img?: any;
}
