import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { User } from "@prisma/client";

@Injectable()
export class NotesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createNote(newNote: CreateNoteDto) {
        try {
            return await this.prisma.secureNote.create({
                data: {
                    title: newNote.title,
                    content: newNote.content,
                    userId: newNote.userId
                },
            });
        } catch (error) {
            throw new ConflictException(`Title '${newNote.title}' is already in use!`);
        }
    }

    async findAllNotes(user: User) {
        return await this.prisma.secureNote.findMany({
            where: {
                userId: user.id
            }
        });
    }

    async findNoteById(id: number) {
        return this.prisma.secureNote.findFirst({
            where: {
                id,
            },
        });
    }

    async deleteNote(id: number) {
        return await this.prisma.secureNote.delete({
            where: {
                id,
            },
        });
    }
}