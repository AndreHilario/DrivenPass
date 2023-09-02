import { INestApplication, ValidationPipe, HttpStatus } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import request from 'supertest';
import faker from "faker";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { CardsFactory } from "./factories/cards.factory";
import { CredentialsFactory } from "./factories/credentials.factory";
import { NotesFactory } from "./factories/notes.factory";
import { UsersFactory } from "./factories/users.factory";
import { E2EUtils } from "./utils/e2e-utils";

describe('Erase E2E Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService = new PrismaService();
    let cardsFactory: CardsFactory;
    let credentialsFactory: CredentialsFactory
    let notesFactory: NotesFactory;
    let usersFactory: UsersFactory;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(prisma)
            .compile();

        app = moduleFixture.createNestApplication();
        notesFactory = new NotesFactory(prisma);
        usersFactory = new UsersFactory(prisma);
        cardsFactory = new CardsFactory(prisma);
        credentialsFactory = new CredentialsFactory(prisma)
        app.useGlobalPipes(new ValidationPipe())
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
                .get('/notes')
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
                .post('/notes')
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('when token is valid', () => {
        it('POST /erase => should delete all cards, notes, credentials and register from a specific user by password', async () => {
            const password = faker.internet.password();
            const user = await usersFactory
                .withEmail(faker.internet.email())
                .withPassword(password)
                .persist();

            const token = await E2EUtils.getToken(app, user, password);
            expect(token).toBeDefined();

            const card = E2EUtils.buildCard(user.id);
            await cardsFactory
                .withTitle(card.title)
                .withCardNumber(card.cardNumber)
                .withPrintedName(card.printedName)
                .withSecurityCode(card.securityCode)
                .withExpirationDate(card.expirationDate)
                .withEncryptedPin(card.encryptedPin)
                .withIsVirtual(card.isVirtual)
                .withType(card.type)
                .withUserId(card.userId)
                .persist()


            const credential = E2EUtils.buildCredential(user.id);
            await credentialsFactory
                .withTitle(credential.title)
                .withUrl(credential.url)
                .withUsername(credential.username)
                .withEncryptedPassword(credential.encryptedPassword)
                .withUserId(credential.userId)
                .persist();

            const note = E2EUtils.buildNote(user.id);
            await notesFactory
                .withTitle(note.title)
                .withContent(note.content)
                .withUserId(note.userId)
                .persist();

            await request(app.getHttpServer())
                .post('/erase')
                .set('Authorization', `Bearer ${token}`)
                .send({ password })
                .expect(HttpStatus.NO_CONTENT);

            const cards = await prisma.card.findMany();
            expect(cards).toHaveLength(0);

            const credentials = await prisma.credential.findMany();
            expect(credentials).toHaveLength(0);

            const notes = await prisma.secureNote.findMany();
            expect(notes).toHaveLength(0);

            const users = await prisma.user.findMany();
            expect(users).toHaveLength(0);

            const session = await prisma.session.findMany();
            expect(session).toHaveLength(0);
        });

        it('POST /erase => should not delete all cards, notes, credentials and register from a specific user when password is wrong', async () => {
            const password = faker.internet.password();
            const user = await usersFactory
                .withEmail(faker.internet.email())
                .withPassword(password)
                .persist();

            const token = await E2EUtils.getToken(app, user, password);
            expect(token).toBeDefined();

            const card = E2EUtils.buildCard(user.id);
            await cardsFactory
                .withTitle(card.title)
                .withCardNumber(card.cardNumber)
                .withPrintedName(card.printedName)
                .withSecurityCode(card.securityCode)
                .withExpirationDate(card.expirationDate)
                .withEncryptedPin(card.encryptedPin)
                .withIsVirtual(card.isVirtual)
                .withType(card.type)
                .withUserId(card.userId)
                .persist()


            const credential = E2EUtils.buildCredential(user.id);
            await credentialsFactory
                .withTitle(credential.title)
                .withUrl(credential.url)
                .withUsername(credential.username)
                .withEncryptedPassword(credential.encryptedPassword)
                .withUserId(credential.userId)
                .persist();

            const note = E2EUtils.buildNote(user.id);
            await notesFactory
                .withTitle(note.title)
                .withContent(note.content)
                .withUserId(note.userId)
                .persist();

            await request(app.getHttpServer())
                .post('/erase')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: "senhaErradaa!2324123@A" })
                .expect(HttpStatus.UNAUTHORIZED);

            const cards = await prisma.card.findMany();
            expect(cards).toHaveLength(1);

            const credentials = await prisma.credential.findMany();
            expect(credentials).toHaveLength(1);

            const notes = await prisma.secureNote.findMany();
            expect(notes).toHaveLength(1);

            const users = await prisma.user.findMany();
            expect(users).toHaveLength(1);

            const session = await prisma.session.findMany();
            expect(session).toHaveLength(1);
        });

        it('POST /erase => should not delete all cards, notes, credentials and register from a specific user when password is missing', async () => {
            const password = faker.internet.password();
            const user = await usersFactory
                .withEmail(faker.internet.email())
                .withPassword(password)
                .persist();

            const token = await E2EUtils.getToken(app, user, password);
            expect(token).toBeDefined();

            const card = E2EUtils.buildCard(user.id);
            await cardsFactory
                .withTitle(card.title)
                .withCardNumber(card.cardNumber)
                .withPrintedName(card.printedName)
                .withSecurityCode(card.securityCode)
                .withExpirationDate(card.expirationDate)
                .withEncryptedPin(card.encryptedPin)
                .withIsVirtual(card.isVirtual)
                .withType(card.type)
                .withUserId(card.userId)
                .persist()


            const credential = E2EUtils.buildCredential(user.id);
            await credentialsFactory
                .withTitle(credential.title)
                .withUrl(credential.url)
                .withUsername(credential.username)
                .withEncryptedPassword(credential.encryptedPassword)
                .withUserId(credential.userId)
                .persist();

            const note = E2EUtils.buildNote(user.id);
            await notesFactory
                .withTitle(note.title)
                .withContent(note.content)
                .withUserId(note.userId)
                .persist();

            await request(app.getHttpServer())
                .post('/erase')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: "" })
                .expect(HttpStatus.BAD_REQUEST);

            const cards = await prisma.card.findMany();
            expect(cards).toHaveLength(1);

            const credentials = await prisma.credential.findMany();
            expect(credentials).toHaveLength(1);

            const notes = await prisma.secureNote.findMany();
            expect(notes).toHaveLength(1);

            const users = await prisma.user.findMany();
            expect(users).toHaveLength(1);

            const session = await prisma.session.findMany();
            expect(session).toHaveLength(1);
        });
    });
});