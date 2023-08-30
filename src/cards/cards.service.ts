import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { CardsRepository } from './cards.repository';
import { UsersRepository } from '../users/users.repository';
import { Card } from './entities/card.entity';
import { CredentialsService } from '../credentials/credentials.service';

@Injectable()
export class CardsService {
  constructor
    (
      private readonly cardsRepository: CardsRepository,
      private readonly usersRepository: UsersRepository,
      private readonly credentialService: CredentialsService
    ) { }

  async create(createCardDto: CreateCardDto) {
    const user = await this.usersRepository.findUserById(createCardDto.userId);
    if (!user) {
      throw new NotFoundException("User not found") //verfifcar questao do token e session, como faz essa validação daqui pra frente
    }

    const encryptedSecurityCode = await this.credentialService.encryptPassword(createCardDto.securityCode);
    const encryptedPin = await this.credentialService.encryptPassword(createCardDto.encryptedPin);

    const newCard = new Card
      (
        createCardDto.title,
        createCardDto.cardNumber.toString(),
        createCardDto.printedName,
        encryptedSecurityCode,
        new Date(createCardDto.expirationDate),
        encryptedPin,
        createCardDto.isVirtual,
        createCardDto.type,
        createCardDto.userId
      );

    return this.cardsRepository.createCard(newCard);
  }

  async findAll() {
    const cards = await this.cardsRepository.findAllCards();

    const decryptedCards = await Promise.all(cards.map(async c => {
      const decryptedSecurityCode = await this.credentialService.decryptPassword(c.securityCode);
      const decryptedPin = await this.credentialService.decryptPassword(c.encryptedPin);
      return { ...c, securityCode: decryptedSecurityCode, encryptedPin: decryptedPin };
    }));

    return decryptedCards;
  }

  async findOne(id: number) {
    const card = await this.cardsErrors(id);
    return card;
  }

  async remove(id: number) {
    await this.cardsErrors(id);
    return this.cardsRepository.deleteCard(id);
  }

  private async cardsErrors(id: number) {
    const card = await this.cardsRepository.findCardById(id);

    if (!card) {
      throw new NotFoundException("Card not found!");
    }

    /*  if (card  && card.userId !== ver o id do user atual, pela session com token e etc ) {
       throw new ForbiddenException("This card doesn't belong to you!");
     } */

    return card;
  }
}
