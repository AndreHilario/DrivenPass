import { Module } from '@nestjs/common';
import { EraseService } from './erase.service';
import { EraseController } from './erase.controller';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { NotesModule } from 'src/notes/notes.module';
import { CardsModule } from 'src/cards/cards.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CredentialsModule, NotesModule, CardsModule, UsersModule],
  controllers: [EraseController],
  providers: [EraseService],
})
export class EraseModule {}
