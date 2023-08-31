import { PrismaService } from "../../src/prisma/prisma.service";
import * as faker from 'faker';
import * as bcrypt from "bcrypt";

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
        }
    }
}