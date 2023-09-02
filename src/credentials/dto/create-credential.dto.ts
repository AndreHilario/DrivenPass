import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Website Login',
    description:
      'Title or name for the credential (e.g., "Website Login"). Must be unique!',
  })
  title: string;

  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    example: 'https://www.example.com',
    description:
      'URL associated with the credential (e.g., "https://www.example.com").',
  })
  url: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'john_doe',
    description: 'Username associated with the credential (e.g., "john_doe").',
  })
  username: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ApiProperty({
    example: 'P@ssw0rd',
    description:
      'Strong and secure password for the credential. Must be at least 6 characters long and include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special symbol.',
  })
  encryptedPassword: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'ID of the user to whom the credential belongs.',
  })
  userId: number;
}
