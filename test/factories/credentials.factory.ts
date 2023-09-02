import Cryptr from 'cryptr';
import { PrismaService } from '../../src/prisma/prisma.service';

export class CredentialsFactory {
  private title: string;
  private url: string;
  private username: string;
  private encryptedPassword: string;
  private userId: number;

  constructor(private readonly prisma: PrismaService) {}

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withUrl(url: string) {
    this.url = url;
    return this;
  }

  withUsername(username: string) {
    this.username = username;
    return this;
  }

  withEncryptedPassword(encryptedPassword: string) {
    const cryptr = new Cryptr('myTotallySecretKey');
    const newEncryptedPassword = cryptr.encrypt(encryptedPassword);
    this.encryptedPassword = newEncryptedPassword;
    return this;
  }

  withUserId(userId: number) {
    this.userId = userId;
    return this;
  }

  build() {
    return {
      title: this.title,
      url: this.url,
      username: this.username,
      encryptedPassword: this.encryptedPassword,
      userId: this.userId,
    };
  }

  async persist() {
    const credential = {
      title: this.title,
      url: this.url,
      username: this.username,
      encryptedPassword: this.encryptedPassword,
      userId: this.userId,
    };
    return await this.prisma.credential.create({
      data: credential,
    });
  }
}
