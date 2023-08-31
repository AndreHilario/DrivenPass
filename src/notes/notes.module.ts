import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotesRepository } from './notes.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
  exports: [NotesService]
})
export class NotesModule { }
