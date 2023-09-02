import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEraseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password required to delete all information and close your account.',
  })
  password: string;
}

