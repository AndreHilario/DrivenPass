import { PrismaService } from "../../src/prisma/prisma.service";

export class E2EUtils {
    static async cleanDb(prisma: PrismaService) {
        await prisma.card.deleteMany();
        await prisma.secureNote.deleteMany();
        await prisma.credential.deleteMany();
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
    }
}