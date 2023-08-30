import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CardsRepository } from './cards.repository';
import { CredentialsModule } from '../credentials/credentials.module';

@Module({
  imports: [PrismaModule, UsersModule, CredentialsModule],
  controllers: [CardsController],
  providers: [CardsService, CardsRepository]
})
export class CardsModule {}
