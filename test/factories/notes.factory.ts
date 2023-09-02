import { PrismaService } from '../../src/prisma/prisma.service';

export class NotesFactory {
  private title: string;
  private content: string;
  private userId: number;

  constructor(private readonly prisma: PrismaService) {}

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withContent(content: string) {
    this.content = content;
    return this;
  }

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  build() {
    return {
      title: this.title,
      content: this.content,
      userId: this.userId,
    };
  }

  async persist() {
    const note = {
      title: this.title,
      content: this.content,
      userId: this.userId,
    };
    return await this.prisma.secureNote.create({
      data: note,
    });
  }
}
