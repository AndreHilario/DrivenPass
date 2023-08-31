import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor
    (
      private readonly notesRepository: NotesRepository,
      private readonly usersService: UsersService
    ) { }

  async create(user: User, createNoteDto: CreateNoteDto) {
    const findUser = await this.usersService.getUserById(createNoteDto.userId);
    if (!findUser) {
      throw new NotFoundException("User not found")
    }

    if (createNoteDto.userId !== user.id) {
      throw new ForbiddenException("You can't create this note!");
    }
    
    const newNote = new Note(createNoteDto.title, createNoteDto.content, user.id);
    return this.notesRepository.createNote(newNote);
  }

  findAll(user: User) {
    return this.notesRepository.findAllNotes(user);
  }

  async findOne(user: User, id: number) {
    const note = await this.noteErrors(user, id);
    return note;
  }

  async remove(user: User, id: number) {
    await this.noteErrors(user, id);
    return this.notesRepository.deleteNote(id);
  }

  private async noteErrors(user: User, id: number) {
    const note = await this.notesRepository.findNoteById(id);

    if (!note) {
      throw new NotFoundException("Note not found!");
    }

    if (note && note.userId !== user.id) {
      throw new ForbiddenException("This note doesn't belong to you!");
    }

    return note;
  }
}
