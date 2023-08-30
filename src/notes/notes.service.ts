import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { NotesRepository } from './notes.repository';
import { Note } from './entities/note.entity';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class NotesService {
  constructor
    (
      private readonly notesRepository: NotesRepository,
      private readonly usersRepository: UsersRepository
    ) { }

  async create(createNoteDto: CreateNoteDto) {
    const user = await this.usersRepository.findUserById(createNoteDto.userId);
    if (!user) {
      throw new NotFoundException("User not found") //verfifcar questao do token e session, como faz essa validação daqui pra frente
    }
    const newNote = new Note(createNoteDto.title, createNoteDto.content, createNoteDto.userId);
    return this.notesRepository.createNote(newNote);
  }

  findAll() {
    return this.notesRepository.findAllNotes();
  }

  async findOne(id: number) {
    const note = await this.noteErrors(id);
    return note;
  }

  async remove(id: number) {
    await this.noteErrors(id);
    return this.notesRepository.deleteNote(id);
  }

  private async noteErrors(id: number) {
    const note = await this.notesRepository.findNoteById(id);

    if (!note) {
      throw new NotFoundException("Note not found!");
    }

    /*  if (note  && note.userId !== ver o id do user atual, pela session com token e etc ) {
       throw new ForbiddenException("This note doesn't belong to you!");
     } */

    return note;
  }
}
