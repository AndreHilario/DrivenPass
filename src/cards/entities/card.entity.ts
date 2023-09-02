import { CardType } from '@prisma/client';

export class Card {
  private _title: string;
  private _cardNumber: string;
  private _printedName: string;
  private _securityCode: string;
  private _expirationDate: Date;
  private _encryptedPin: string;
  private _isVirtual: boolean;
  private _type: CardType;
  private _userId: number;

  constructor(
    title: string,
    cardNumber: string,
    printedName: string,
    securityCode: string,
    expirationDate: Date,
    encryptedPin: string,
    isVirtual: boolean,
    type: CardType,
    userId: number,
  ) {
    this._title = title;
    this._cardNumber = cardNumber;
    this._printedName = printedName;
    this._securityCode = securityCode;
    this._expirationDate = expirationDate;
    this._encryptedPin = encryptedPin;
    this._isVirtual = isVirtual;
    this._type = type;
    this._userId = userId;
  }

  get title() {
    return this._title;
  }

  get cardNumber() {
    return this._cardNumber;
  }

  get printedName() {
    return this._printedName;
  }

  get securityCode() {
    return this._securityCode;
  }

  get expirationDate() {
    return this._expirationDate;
  }

  get encryptedPin() {
    return this._encryptedPin;
  }

  get isVirtual() {
    return this._isVirtual;
  }

  get type() {
    return this._type;
  }

  get userId() {
    return this._userId;
  }
}
