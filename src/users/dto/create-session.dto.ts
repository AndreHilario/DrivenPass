import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'exemplo@exemplo.com',
    description: 'Valid email address used for sign-up.',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 's3nh@f0rTe!',
    description: 'Password used for sign-up.',
  })
  password: string;
}
