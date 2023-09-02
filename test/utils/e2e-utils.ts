import { PrismaService } from "../../src/prisma/prisma.service";
import * as faker from 'faker';
import * as bcrypt from "bcrypt";
import { INestApplication, HttpStatus } from "@nestjs/common";
import { User } from "@prisma/client";
import request from 'supertest';

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
            password: hashPassword
        };
    };

    static buildCredential(userId: number) {
        const password = "SenhaForteDeT3st2!@#";
        return {
            title: faker.lorem.word(),
            url: faker.internet.url(),
            username: faker.internet.userName(),
            encryptedPassword: password,
            userId
        };
    };

    static buildNote(userId: number) {
        const uniqueTitle = faker.random.alphaNumeric(10);
        return {
            title: uniqueTitle,
            content: faker.lorem.words(6),
            userId
        };
    };

    static async getToken(app: INestApplication, user: User, password: string) {
        const response = await request(app.getHttpServer())
            .post('/users/login')
            .send({
                email: user.email,
                password,
            })
            .expect(HttpStatus.OK);

        return response.body.token;
    };

}