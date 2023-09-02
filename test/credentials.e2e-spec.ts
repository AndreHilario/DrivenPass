import { CredentialsFactory } from './factories/credentials.factory';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { E2EUtils } from './utils/e2e-utils';
import faker from 'faker';
import { UsersFactory } from './factories/users.factory';
import request from 'supertest';
import { CreateCredentialDto } from '../src/credentials/dto/create-credential.dto';
import { Credential } from '../src/credentials/entities/credential.entity';

describe('Credentials E2E Tests', () => {
  let app: INestApplication;
  const prisma: PrismaService = new PrismaService();
  let credentialsFactory: CredentialsFactory;
  let usersFactory: UsersFactory;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    credentialsFactory = new CredentialsFactory(prisma);
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
        .get('/credentials')
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
        .get('/credentials')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('POST /credentials => should create a credential', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildCredential(user.id);
      const { title, url, username, encryptedPassword, userId } = credential;

      const credentialDto: CreateCredentialDto = new Credential(
        title,
        url,
        username,
        encryptedPassword,
        userId,
      );
      const credentialBody = {
        title: credentialDto.title,
        url: credentialDto.url,
        username: credentialDto.username,
        encryptedPassword: credentialDto.encryptedPassword,
        userId: credentialDto.userId,
      };

      await request(app.getHttpServer())
        .post('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .send(credentialBody)
        .expect(HttpStatus.CREATED);

      const credentials = await prisma.credential.findMany();
      expect(credentials).toHaveLength(1);

      const credentialCreated = credentials[0];

      expect(credentialCreated).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        url: expect.any(String),
        username: expect.any(String),
        encryptedPassword: expect.any(String),
        userId: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('POST /credentials => should not create a credential when properties missing or wrong', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credentialDto: CreateCredentialDto = new Credential(
        '',
        '',
        '',
        '',
        0,
      );
      const credentialBody = {
        title: credentialDto.title,
        url: credentialDto.url,
        username: credentialDto.username,
        encryptedPassword: credentialDto.encryptedPassword,
        userId: credentialDto.userId,
      };

      await request(app.getHttpServer())
        .post('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .send(credentialBody)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('POST /credentials => should not create a credential when title is already in use', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildCredential(user.id);
      const { title, url, username, encryptedPassword, userId } = credential;

      const newCredential = await credentialsFactory
        .withTitle(title)
        .withUrl(url)
        .withUsername(username)
        .withEncryptedPassword(encryptedPassword)
        .withUserId(userId)
        .persist();

      const credentialBody = {
        title: newCredential.title,
        url: newCredential.url,
        username: newCredential.username,
        encryptedPassword: 'SenhaForteDeT3st2!@#',
        userId: newCredential.userId,
      };

      await request(app.getHttpServer())
        .post('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .send(credentialBody)
        .expect(HttpStatus.CONFLICT);
    });

    it('GET /credentials => should return all credentials from user with decrypt password', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const firstCredential = E2EUtils.buildCredential(user.id);

      await credentialsFactory
        .withTitle(firstCredential.title)
        .withUrl(firstCredential.url)
        .withUsername(firstCredential.username)
        .withEncryptedPassword(firstCredential.encryptedPassword)
        .withUserId(firstCredential.userId)
        .persist();

      const secondCredential = E2EUtils.buildCredential(user.id);

      await credentialsFactory
        .withTitle(secondCredential.title)
        .withUrl(secondCredential.url)
        .withUsername(secondCredential.username)
        .withEncryptedPassword(secondCredential.encryptedPassword)
        .withUserId(secondCredential.userId)
        .persist();

      const { body } = await request(app.getHttpServer())
        .get('/credentials')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toHaveLength(2);
      expect(body).toEqual([
        {
          id: expect.any(Number),
          title: expect.any(String),
          url: expect.any(String),
          username: expect.any(String),
          encryptedPassword: 'SenhaForteDeT3st2!@#',
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
          url: expect.any(String),
          username: expect.any(String),
          encryptedPassword: 'SenhaForteDeT3st2!@#',
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

    it('GET /credentials/:id => should get a specific credential by id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildCredential(user.id);

      const newCredential = await credentialsFactory
        .withTitle(credential.title)
        .withUrl(credential.url)
        .withUsername(credential.username)
        .withEncryptedPassword(credential.encryptedPassword)
        .withUserId(credential.userId)
        .persist();

      const { body } = await request(app.getHttpServer())
        .get(`/credentials/${newCredential.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        url: expect.any(String),
        username: expect.any(String),
        encryptedPassword: 'SenhaForteDeT3st2!@#',
        userId: expect.any(Number),
        createdAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
        updatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
        ),
      });
    });

    it('GET /credentials/:id => should not get a specific credential when "id" does not exist', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .get(`/credentials/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('GET /credentials/:id => should not get a specific credential when "id" does not belong to the current user', async () => {
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

      const credential = E2EUtils.buildCredential(fakeUser.id);

      const newCredential = await credentialsFactory
        .withTitle(credential.title)
        .withUrl(credential.url)
        .withUsername(credential.username)
        .withEncryptedPassword(credential.encryptedPassword)
        .withUserId(credential.userId)
        .persist();

      await request(app.getHttpServer())
        .get(`/credentials/${newCredential.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /credentials/:id => should not delete a credential when "id" does not belong to the current user', async () => {
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

      const credential = E2EUtils.buildCredential(fakeUser.id);

      const newCredential = await credentialsFactory
        .withTitle(credential.title)
        .withUrl(credential.url)
        .withUsername(credential.username)
        .withEncryptedPassword(credential.encryptedPassword)
        .withUserId(credential.userId)
        .persist();

      await request(app.getHttpServer())
        .delete(`/credentials/${newCredential.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('DELETE /credentials/:id => should not delete a specific credential when "id" does not exist', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/credentials/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('DELETE /credentials/:id => should delete a specific credential by id', async () => {
      const password = faker.internet.password();
      const user = await usersFactory
        .withEmail(faker.internet.email())
        .withPassword(password)
        .persist();

      const token = await E2EUtils.getToken(app, user, password);
      expect(token).toBeDefined();

      const credential = E2EUtils.buildCredential(user.id);

      const newCredential = await credentialsFactory
        .withTitle(credential.title)
        .withUrl(credential.url)
        .withUsername(credential.username)
        .withEncryptedPassword(credential.encryptedPassword)
        .withUserId(credential.userId)
        .persist();

      await request(app.getHttpServer())
        .delete(`/credentials/${newCredential.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT);

      const deletedCredential = await prisma.credential.findMany();
      expect(deletedCredential).toHaveLength(0);
    });
  });
});
