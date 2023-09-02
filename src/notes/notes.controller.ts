import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create a new secure note with the userID',
  })
  create(@Body() createNoteDto: CreateNoteDto, @User() user: UserPrisma) {
    return this.notesService.create(user, createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes by userID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all notes belonging to the current user',
  })
  findAll(@User() user: UserPrisma) {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID to get a specific note',
    example: 8,
  })
  @ApiOperation({ summary: 'Get a specific note by userID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Get a object with the specific note that belongs to the current user',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.notesService.findOne(user, id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID to delete a specific note',
    example: 8,
  })
  @ApiOperation({ summary: 'Delete a specific note by userID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Get the specific note that belongs to the current user',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.notesService.remove(user, id);
  }
}
