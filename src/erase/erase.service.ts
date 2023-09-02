import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateEraseDto } from './dto/create-erase.dto';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { CredentialsService } from '../credentials/credentials.service';
import { NotesService } from '../notes/notes.service';
import { CardsService } from '../cards/cards.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EraseService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly notesService: NotesService,
    private readonly cardsService: CardsService,
  ) {}

  async eraseAccount(user: User, createEraseDto: CreateEraseDto) {
    const userPassword = await this.usersService.getUserById(user.id);
    const passwordMatch = await bcrypt.compare(
      createEraseDto.password,
      userPassword.password,
    );

    if (!passwordMatch)
      throw new UnauthorizedException('Unauthorized user, incorrect password');

    await this.cardsService.deleteAllByUserId(user.id);
    await this.notesService.deleteAllByUserId(user.id);
    await this.credentialsService.deleteAllByUserId(user.id);
    return this.usersService.deleteUserAndSession(user.id);
  }
}
