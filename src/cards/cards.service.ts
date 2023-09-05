import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { CardsRepository } from './cards.repository';
import { Card } from './entities/card.entity';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly usersService: UsersService,
    private readonly credentialService: CredentialsService,
  ) {}

  async create(user: User, createCardDto: CreateCardDto) {
    const findUser = await this.usersService.getUserById(createCardDto.userId);
    if (!findUser) {
      throw new NotFoundException('User not found');
    }

    if (createCardDto.userId !== user.id) {
      throw new ForbiddenException("You can't create this card!");
    }

    const encryptedSecurityCode = await this.credentialService.encryptPassword(
      createCardDto.securityCode,
    );
    const encryptedPin = await this.credentialService.encryptPassword(
      createCardDto.encryptedPin,
    );

    const newCard = new Card(
      createCardDto.title,
      createCardDto.cardNumber.toString(),
      createCardDto.printedName,
      encryptedSecurityCode,
      new Date(createCardDto.expirationDate),
      encryptedPin,
      createCardDto.isVirtual,
      createCardDto.type,
      user.id,
    );

    return this.cardsRepository.createCard(newCard);
  }

  async findAll(user: User) {
    const cards = await this.cardsRepository.findAllCards(user);

    const decryptedCards = await Promise.all(
      cards.map(async (c) => {
        const decryptedSecurityCode =
          await this.credentialService.decryptPassword(c.securityCode);
        const decryptedPin = await this.credentialService.decryptPassword(
          c.encryptedPin,
        );
        return {
          ...c,
          securityCode: decryptedSecurityCode,
          encryptedPin: decryptedPin,
        };
      }),
    );

    return decryptedCards;
  }

  async findOne(user: User, id: number) {
    const card = await this.cardsErrors(user, id);

    return {
      ...card, 
      securityCode: await this.credentialService.decryptPassword(card.securityCode),
      encryptedPin: await this.credentialService.decryptPassword(card.encryptedPin),
    };
  }

  async remove(user: User, id: number) {
    await this.cardsErrors(user, id);
    return this.cardsRepository.deleteCard(id);
  }

  async deleteAllByUserId(id: number) {
    return this.cardsRepository.deleteAll(id);
  }

  private async cardsErrors(user: User, id: number) {
    const card = await this.cardsRepository.findCardById(id);

    if (!card) {
      throw new NotFoundException('Card not found!');
    }

    if (card && card.userId !== user.id) {
      throw new ForbiddenException("This card doesn't belong to you!");
    }

    return card;
  }
}
