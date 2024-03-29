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
  @ApiProperty()
  email: string;
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;
  @IsString()
  @Length(0, 13)
  @Matches(/^\+38\d{10}$/, {
    message:
      'The numberPhone field must start with "+38" and allow an additional 10 digits.',
  })
  @IsNotEmpty()
  @ApiProperty()
  numberPhone: string;
  @IsString()
  @Length(6, 20)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'The password field must contain 6-20 characters: only letters, digits, at least 1 special character, at least 1 uppercase letter.',
  })
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
