import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'exemplo@exemplo.com',
    description: 'Valid and unique email address for sign-up.',
  })
  email: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 10,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @ApiProperty({
    example: 's3nh@f0rTe!',
    description:
      'Password for sign-up. Must be at least 10 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 symbol, and 1 number.',
  })
  password: string;
}
