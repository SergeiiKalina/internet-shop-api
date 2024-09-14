import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(6, 20)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()^{}#+._=;:'",<>\/\[\]])[A-Za-z\d@$!%*?&()^{}#+._=;:'",<>\/\[\]]{6,}$/,
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
