import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import faker from 'faker';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CardsFactory } from './factories/cards.factory';
import { UsersFactory } from './factories/users.factory';
import { E2EUtils } from './utils/e2e-utils';
import { CreateCardDto } from '../src/cards/dto/create-card.dto';
import { Card } from '../src/cards/entities/card.entity';

describe('Cards E2E Tests', () => {
  let app: INestApplication;
  const prisma: PrismaService = new PrismaService();
  let cardsFactory: CardsFactory;
  let usersFactory: UsersFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    cardsFactory = new CardsFactory(prisma);
    usersFactory = new UsersFactory(prisma);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await E2EUtils.cleanDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('when token is not valid', () => {
    it('should return unauthorized when token is incorrect', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${token}w`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return unauthorized when token is missing', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .get('/cards')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('POST /cards => should create a card', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const cardDto = E2EUtils.buildCard(user.id);

      const cardBody = {
        title: cardDto.title,
        cardNumber: cardDto.cardNumber,
        printedName: cardDto.printedName,
        securityCode: cardDto.securityCode,
        expirationDate: cardDto.expirationDate,
        encryptedPin: cardDto.encryptedPin,
        isVirtual: cardDto.isVirtual,
        type: cardDto.type,
        userId: cardDto.userId,
      };

      await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send(cardBody)
        .expect(HttpStatus.CREATED);

      const cards = await prisma.card.findMany();
      expect(cards).toHaveLength(1);

      const cardCreated = cards[0];

      expect(cardCreated).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        cardNumber: expect.any(String),
        printedName: expect.any(String),
        securityCode: expect.any(String),
        expirationDate: expect.any(Date),
        encryptedPin: expect.any(String),
        isVirtual: expect.any(Boolean),
        type: cardBody.type,
        userId: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('POST /cards => should not create a card when properties missing or wrong', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const cardDto: CreateCardDto = new Card(
        '',
        '',
        '',
        '',
        new Date(),
        '',
        false,
        'BOTH',
        0,
      );
      const cardBody = {
        title: cardDto.title,
        cardNumber: cardDto.cardNumber,
        printedName: cardDto.printedName,
        securityCode: cardDto.securityCode,
        expirationDate: cardDto.expirationDate,
        encryptedPin: cardDto.encryptedPin,
        isVirtual: cardDto.isVirtual,
        type: cardDto.type,
        userId: cardDto.userId,
      };

      await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send(cardBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /cards => should not create a card when title is already in use', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const card = E2EUtils.buildCard(user.id);
      const {
        title,
        cardNumber,
        printedName,
        securityCode,
        expirationDate,
        encryptedPin,
        isVirtual,
        type,
        userId,
      } = card;

      const newCard = await cardsFactory
        .withTitle(title)
        .withCardNumber(cardNumber)
        .withPrintedName(printedName)
        .withSecurityCode(securityCode)
        .withExpirationDate(expirationDate)
        .withEncryptedPin(encryptedPin)
        .withIsVirtual(isVirtual)
        .withType(type)
        .withUserId(userId)
        .persist();

      const cardBody = {
        title: newCard.title,
        cardNumber: newCard.cardNumber,
        printedName: newCard.printedName,
        securityCode: newCard.securityCode,
        expirationDate: newCard.expirationDate,
        encryptedPin: newCard.encryptedPin,
        isVirtual: newCard.isVirtual,
        type: newCard.type,
        userId: newCard.userId,
      };

      await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send(cardBody)
        .expect(HttpStatus.CONFLICT);
    });

    it('GET /cards => should return all cards from user', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const firstCard = E2EUtils.buildCard(user.id);

      await cardsFactory
        .withTitle(firstCard.title)
        .withCardNumber(firstCard.cardNumber)
        .withPrintedName(firstCard.printedName)
        .withSecurityCode(firstCard.securityCode)
        .withExpirationDate(firstCard.expirationDate)
        .withEncryptedPin(firstCard.encryptedPin)
        .withIsVirtual(firstCard.isVirtual)
        .withType(firstCard.type)
        .withUserId(firstCard.userId)
        .persist();

      const secondCard = E2EUtils.buildCard(user.id);

      await cardsFactory
        .withTitle(secondCard.title)
        .withCardNumber(secondCard.cardNumber)
        .withPrintedName(secondCard.printedName)
        .withSecurityCode(secondCard.securityCode)
        .withExpirationDate(secondCard.expirationDate)
        .withEncryptedPin(secondCard.encryptedPin)
        .withIsVirtual(secondCard.isVirtual)
        .withType(secondCard.type)
        .withUserId(secondCard.userId)
        .persist();

      const thirdCard = E2EUtils.buildCard(fakeUser.id);

      await cardsFactory
        .withTitle(thirdCard.title)
        .withCardNumber(thirdCard.cardNumber)
        .withPrintedName(thirdCard.printedName)
        .withSecurityCode(thirdCard.securityCode)
        .withExpirationDate(thirdCard.expirationDate)
        .withEncryptedPin(thirdCard.encryptedPin)
        .withIsVirtual(thirdCard.isVirtual)
        .withType(thirdCard.type)
        .withUserId(thirdCard.userId)
        .persist();

      const { body } = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toHaveLength(2);
      expect(body).toEqual([
        {
          id: expect.any(Number),
          title: expect.any(String),
          cardNumber: expect.any(String),
          printedName: expect.any(String),
          securityCode: expect.any(String),
          expirationDate: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
          encryptedPin: expect.any(String),
          isVirtual: expect.any(Boolean),
          type: 'CREDIT',
          userId: expect.any(Number),
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
          updatedAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
        },
        {
          id: expect.any(Number),
          title: expect.any(String),
          cardNumber: expect.any(String),
          printedName: expect.any(String),
          securityCode: expect.any(String),
          expirationDate: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
          encryptedPin: expect.any(String),
          isVirtual: expect.any(Boolean),
          type: 'CREDIT',
          userId: expect.any(Number),
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
          updatedAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
          ),
        },
      ]);
    });

    it('GET /cards/:id => should get a specific card by id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const card = E2EUtils.buildCard(user.id);

      const newCard = await cardsFactory
        .withTitle(card.title)
        .withCardNumber(card.cardNumber)
        .withPrintedName(card.printedName)
        .withSecurityCode(card.securityCode)
        .withExpirationDate(card.expirationDate)
        .withEncryptedPin(card.encryptedPin)
        .withIsVirtual(card.isVirtual)
        .withType(card.type)
        .withUserId(card.userId)
        .persist();

      const { body } = await request(app.getHttpServer())
        .get(`/cards/${newCard.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        cardNumber: expect.any(String),
        printedName: expect.any(String),
        securityCode: expect.any(String),
        expirationDate: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
        encryptedPin: expect.any(String),
        isVirtual: expect.any(Boolean),
        type: 'CREDIT',
        userId: expect.any(Number),
        createdAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
        updatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
      });
    });

    it('GET /cards/:id => should not get a specific card when "id" does not exist', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .get(`/cards/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('GET /cards/:id => should not get a specific card when "id" does not belong to the current user', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const card = E2EUtils.buildCard(fakeUser.id);

      const newCard = await cardsFactory
        .withTitle(card.title)
        .withCardNumber(card.cardNumber)
        .withPrintedName(card.printedName)
        .withSecurityCode(card.securityCode)
        .withExpirationDate(card.expirationDate)
        .withEncryptedPin(card.encryptedPin)
        .withIsVirtual(card.isVirtual)
        .withType(card.type)
        .withUserId(card.userId)
        .persist();

      await request(app.getHttpServer())
        .get(`/cards/${newCard.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /cards/:id => should not delete a card when "id" does not belong to the current user', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const fakeUser = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const card = E2EUtils.buildCard(fakeUser.id);

      const newCard = await cardsFactory
        .withTitle(card.title)
        .withCardNumber(card.cardNumber)
        .withPrintedName(card.printedName)
        .withSecurityCode(card.securityCode)
        .withExpirationDate(card.expirationDate)
        .withEncryptedPin(card.encryptedPin)
        .withIsVirtual(card.isVirtual)
        .withType(card.type)
        .withUserId(card.userId)
        .persist();

      await request(app.getHttpServer())
        .delete(`/cards/${newCard.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /cards/:id => should not delete a specific card when "id" does not exist', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/cards/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('DELETE /cards/:id => should delete a specific card by id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const card = E2EUtils.buildCard(user.id);

      const newCard = await cardsFactory
        .withTitle(card.title)
        .withCardNumber(card.cardNumber)
        .withPrintedName(card.printedName)
        .withSecurityCode(card.securityCode)
        .withExpirationDate(card.expirationDate)
        .withEncryptedPin(card.encryptedPin)
        .withIsVirtual(card.isVirtual)
        .withType(card.type)
        .withUserId(card.userId)
        .persist();

      await request(app.getHttpServer())
        .delete(`/cards/${newCard.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT);

      const deletedCard = await prisma.card.findMany();
      expect(deletedCard).toHaveLength(0);
    });
  });
});
