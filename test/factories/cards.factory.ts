import Cryptr from 'cryptr';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CardType } from '@prisma/client';

export class CardsFactory {
  private title: string;
  private cardNumber: string;
  private printedName: string;
  private securityCode: string;
  private expirationDate: Date;
  private encryptedPin: string;
  private isVirtual: boolean;
  private type: CardType;
  private userId: number;

  constructor(private readonly prisma: PrismaService) {}

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withCardNumber(cardNumber: string) {
    this.cardNumber = cardNumber;
    return this;
  }

  withPrintedName(printedName: string) {
    this.printedName = printedName;
    return this;
  }

  withSecurityCode(securityCode: string) {
    const cryptr = new Cryptr('myTotallySecretKey');
    const newSecurityCode = cryptr.encrypt(securityCode);
    this.securityCode = newSecurityCode;
    return this;
  }

  withExpirationDate(expirationDate: Date) {
    this.expirationDate = expirationDate;
    return this;
  }

  withEncryptedPin(encryptedPin: string) {
    const cryptr = new Cryptr('myTotallySecretKey');
    const newEncryptedPin = cryptr.encrypt(encryptedPin);
    this.encryptedPin = newEncryptedPin;
    return this;
  }

  withIsVirtual(isVirtual: boolean) {
    this.isVirtual = isVirtual;
    return this;
  }

  withType(type: CardType) {
    this.type = type;
    return this;
  }

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  build() {
    return {
      title: this.title,
      cardNumber: this.cardNumber,
      printedName: this.printedName,
      securityCode: this.securityCode,
      expirationDate: this.expirationDate,
      encryptedPin: this.encryptedPin,
      isVirtual: this.isVirtual,
      type: this.type,
      userId: this.userId,
    };
  }

  async persist() {
    const card = {
      title: this.title,
      cardNumber: this.cardNumber,
      printedName: this.printedName,
      securityCode: this.securityCode,
      expirationDate: this.expirationDate,
      encryptedPin: this.encryptedPin,
      isVirtual: this.isVirtual,
      type: this.type,
      userId: this.userId,
    };
    return await this.prisma.card.create({
      data: card,
    });
  }
}
