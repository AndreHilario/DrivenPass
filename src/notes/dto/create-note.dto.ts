import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Choose a title',
    description:
      'Title of the note. Please choose a unique title for your note.',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Here you can write whatever you want',
    description: 'Content of the note. Write your notes in a safe place.',
  })
  content: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 8,
    description: 'ID of the user to whom the note belongs.',
  })
  userId: number;
}
