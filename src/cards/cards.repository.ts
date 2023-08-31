import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCardDto } from "./dto/create-card.dto";
import { User } from "@prisma/client";

@Injectable()
export class CardsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createCard(newCard: CreateCardDto) {
        try {
            return await this.prisma.card.create({
                data: {
                    title: newCard.title,
                    cardNumber: newCard.cardNumber,
                    printedName: newCard.printedName,
                    securityCode: newCard.securityCode,
                    expirationDate: newCard.expirationDate,
                    encryptedPin: newCard.encryptedPin,
                    isVirtual: newCard.isVirtual,
                    type: newCard.type,
                    userId: newCard.userId
                },
            });
        } catch (error) {
            throw new ConflictException(`Title '${newCard.title}' is already in use!`);
        }
    }

    async findAllCards(user: User) {
        return await this.prisma.card.findMany({
            where: {
                userId: user.id
            }
        });
    }

    async findCardById(id: number) {
        return this.prisma.card.findFirst({
            where: {
                id,
            },
        });
    }

    async deleteCard(id: number) {
        return await this.prisma.card.delete({
            where: {
                id,
            },
        });
    }

    async deleteAll(id: number) {
        return await this.prisma.card.deleteMany({
            where: {
                userId: id,
            },
        });
    }
}