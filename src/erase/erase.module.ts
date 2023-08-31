import { Module } from '@nestjs/common';
import { EraseService } from './erase.service';
import { EraseController } from './erase.controller';
import { CredentialsModule } from '../credentials/credentials.module';
import { NotesModule } from '../notes/notes.module';
import { CardsModule } from '../cards/cards.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CredentialsModule, NotesModule, CardsModule, UsersModule],
  controllers: [EraseController],
  providers: [EraseService],
})
export class EraseModule {}
