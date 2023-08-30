import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCredentialDto } from "./dto/create-credential.dto";

@Injectable()
export class CredentialsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createCredential(newCredential: CreateCredentialDto) {
        try {
            return await this.prisma.credential.create({
                data: {
                    title: newCredential.title,
                    url: newCredential.url,
                    username: newCredential.username,
                    encryptedPassword: newCredential.encryptedPassword,
                    userId: newCredential.userId
                },
            });
        } catch (error) {
            throw new ConflictException(`You already have '${newCredential.title}' as a title!`);
        }
    }

    async findAllCredentials() {
        return await this.prisma.credential.findMany();
    }

    async findCredentialById(id: number) {
        return await this.prisma.credential.findFirst({
            where: {
                id,
            },
        });
    }

    async deleteCredentialById(id: number) {
        return await this.prisma.credential.delete({
            where: {
                id,
            },
        });
    }
}