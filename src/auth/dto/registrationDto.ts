import {
  IsEmail,
  IsString,
  Length,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email address' })
  email: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @ApiProperty({
    description: 'First name (2-20 characters)',
  })
  firstName: string;

  @IsString()
  @Length(2, 20)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Last name (3-20 characters)',
  })
  lastName: string;

  @IsString()
  @Length(0, 13)
  @Matches(/^\+38\d{10}$/, {
    message:
      'The numberPhone field must start with "+38" and allow an additional 10 digits.',
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
