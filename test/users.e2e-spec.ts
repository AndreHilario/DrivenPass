import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import * as faker from 'faker';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { CreateUserDto } from "../src/users/dto/create-user.dto";
import { Users } from "../src/users/entities/user.entity";
import { UsersFactory } from "./factories/users.factory";
import { E2EUtils } from "./utils/e2e-utils";

describe('Users E2E Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService = new PrismaService();
    let usersFactory: UsersFactory;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(prisma)
            .compile();

        app = moduleFixture.createNestApplication();
        usersFactory = new UsersFactory(prisma);
        app.useGlobalPipes(new ValidationPipe())
        await app.init();

        await E2EUtils.cleanDb(prisma);
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it('POST /users/sign-up => should create a user and return 201', async () => {
        const user = E2EUtils.buildUserFaker();
        const userDto: CreateUserDto = new Users(user.email, user.password);

        const body = {
            email: userDto.email,
            password: userDto.password
        };

        await request(app.getHttpServer())
            .post('/users/sign-up')
            .send(body)
            .expect(HttpStatus.CREATED)

        const users = await prisma.user.findMany();
        expect(users).toHaveLength(1);

        const userCreated = users[0];
        const isPasswordMatch = await bcrypt.compare(body.password, userCreated.password);

        expect(userCreated.email).toEqual(body.email);
        expect(isPasswordMatch).toBe(true);
        expect(userCreated.createdAt).toBeInstanceOf(Date);
        expect(userCreated.updatedAt).toBeInstanceOf(Date);
    });

    it('POST /users/sign-up => should not create a user with properties missing', async () => {
        const userDto: CreateUserDto = new Users("", "");
        const body = {
            email: userDto.email,
            password: userDto.password
        };

        await request(app.getHttpServer())
            .post('/users/sign-up')
            .send(body)
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('POST /users/login => should do login and return a valid jwt token', async () => {
        const password = faker.internet.password();
        const user = await usersFactory
            .withEmail(faker.internet.email())
            .withPassword(password)
            .persist();

        const body = {
            email: user.email,
            password: password,
        };

        const response = await request(app.getHttpServer())
            .post('/users/login')
            .send(body)
            .expect(HttpStatus.OK);

        const token = response.body.token;
        expect(token).toBeDefined();
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            expect(decodedToken).toBeDefined();
        } catch (error) {
            throw new Error('Token inválido: ' + error.message);
        }
    });

    it('POST /users/login => should do not login when the password is wrong', async () => {
        const password = faker.internet.password();
        const user = await usersFactory
            .withEmail(faker.internet.email())
            .withPassword(password)
            .persist();

        const body = {
            email: user.email,
            password: faker.internet.password(),
        };

        await request(app.getHttpServer())
            .post('/users/login')
            .send(body)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /users/login => should do not login when the email is wrong', async () => {
        const password = faker.internet.password();
        await usersFactory
            .withEmail(faker.internet.email())
            .withPassword(password)
            .persist();

        const body = {
            email: "teste@teste.com",
            password: password,
        };

        await request(app.getHttpServer())
            .post('/users/login')
            .send(body)
            .expect(HttpStatus.UNAUTHORIZED);
    });
});  