import { ApiProperty } from '@nestjs/swagger';
import { CardType } from '@prisma/client';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumberString,
  Length,
  IsDateString,
} from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My Credit Card',
    description:
      'A title or name for the card (e.g., "My Credit Card"). Must be unique!',
  })
  title: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(14, 16, {
    message: 'Card number must be among 14 and 16 numeric digits.',
  })
  @ApiProperty({
    example: '1234567890123456',
    description: 'Card number (numeric) with 14 to 16 digits.',
  })
  cardNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'John Doe',
    description: 'The printed name on the card (e.g., "John Doe").',
  })
  printedName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '123',
    description: 'Security code (e.g., "123").',
  })
  securityCode: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    example: '2023-12-31',
    description: 'Expiration date of the card (e.g., "2023-12-31").',
  })
  expirationDate: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '171222',
    description: 'PIN for the card (e.g., "171222").',
  })
  encryptedPin: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Indicates whether the card is virtual (true or false).',
  })
  isVirtual: boolean;

  @IsNotEmpty()
  @IsIn(['CREDIT', 'DEBIT', 'BOTH'])
  @ApiProperty({
    enum: ['CREDIT', 'DEBIT', 'BOTH'],
    description: 'Type of the card (e.g., "CREDIT", "DEBIT", or "BOTH").',
  })
  type: CardType;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: 'ID of the user to whom the card belongs.',
  })
  userId: number;
}
