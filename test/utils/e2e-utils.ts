import { HttpStatus, INestApplication } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as faker from 'faker';
import request from 'supertest';
import { CreateCardDto } from '../../src/cards/dto/create-card.dto';
import { PrismaService } from '../../src/prisma/prisma.service';

export class E2EUtils {
  static async cleanDb(prisma: PrismaService) {
    await prisma.card.deleteMany();
    await prisma.secureNote.deleteMany();
    await prisma.credential.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  }

  static buildUserFaker() {
    const hashPassword = bcrypt.hashSync(faker.internet.password(), 10);
    return {
      email: faker.internet.email(),
      password: hashPassword,
    };
  }

  static buildCredential(userId: number) {
    const password = 'SenhaForteDeT3st2!@#';
    return {
      title: faker.lorem.word(),
      url: faker.internet.url(),
      username: faker.internet.userName(),
      encryptedPassword: password,
      userId,
    };
  }

  static buildNote(userId: number) {
    const uniqueTitle = faker.random.alphaNumeric(10);
    return {
      title: uniqueTitle,
      content: faker.lorem.words(6),
      userId,
    };
  }

  static buildCard(userId: number): CreateCardDto {
    const card: CreateCardDto = new CreateCardDto();

    card.title = faker.lorem.words();
    card.cardNumber = faker.datatype
      .number({ min: 100000000000000, max: 999999999999999 })
      .toString();
    card.printedName = faker.internet.userName();
    card.securityCode = faker.datatype
      .number({ min: 100, max: 9999 })
      .toString();
    card.expirationDate = faker.date.future();
    card.encryptedPin = faker.datatype
      .number({ min: 100000000, max: 999999999 })
      .toString();
    card.isVirtual = faker.datatype.boolean();
    card.type = 'CREDIT';
    card.userId = userId;

    return card;
  }

  static async getToken(app: INestApplication, user: User, password: string) {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: user.email,
        password,
      })
      .expect(HttpStatus.OK);

    return response.body.token;
  }
}
