import {
  IsEmail,
  IsString,
  Length,
  Matches,
  IsNotEmpty,
  ValidationError,
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
    message:
      'Email address must contain only Latin characters and this symbol (. _  + -)',
  })
  email: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @ApiProperty({
    description:
      'First name (2-20 characters) and must contain only Cyrillic, Latin characters, and dashes.',
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-]+$/, {
    message: 'Name must contain only Cyrillic, Latin characters, and dashes.',
  })
  firstName: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Last name (2-20 characters) and must contain only Cyrillic, Latin characters, and dashes.',
  })
  @Matches(/^[а-яА-ЯёЁa-zA-ZіІїЇєЄґҐ\-]+$/, {
    message:
      'Last name must contain only Cyrillic, Latin characters, and dashes.',
  })
  lastName: string;

  @IsString()
  @Matches(/^\s*\+38\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*$/, {
    message:
      'The numberPhone field must start with "+38" followed by 10 digits, with optional spaces anywhere.',
  })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Phone number (+38XXXXXXXXXX)',
  })
  numberPhone: string;

  @IsString()
  @Length(6, 20)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&().])[A-Za-z\d@$!%*?&().]{6,}$/, {
    message:
      'Password must contain 6-20 characters: letters, digits, at least 1 special character, at least 1 uppercase letter.',
  })
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Password (6-20 characters, must contain at least 1 special character and 1 uppercase letter)',
  })
  password: string;
}
