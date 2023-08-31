import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(newUser: CreateUserDto) {
        return await this.prisma.user.create({
            data: {
                email: newUser.email,
                password: newUser.password,
            },
        });
    }

    async createSession(token: string, userId: number) {
        return await this.prisma.session.create({
            data: {
                token,
                userId
            },
        });
    }

    async findUserByEmail(email: string) {
        return await this.prisma.user.findFirst({
            where: {
                email,
            },
        });
    }

    async findUserById(id: number) {
        return await this.prisma.user.findFirst({
            where: {
                id,
            },
        });
    }

    async deleteUser(id: number) {
        return await this.prisma.user.delete({
            where: {
                id
            }
        });
    }

    async deleteSession(id: number) {
        return await this.prisma.session.deleteMany({
            where: {
                userId: id
            }
        });
    }
}