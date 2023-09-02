import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { CredentialsRepository } from './credentials.repository';
import { Credential } from './entities/credential.entity';
import Cryptr from 'cryptr';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(user: User, createCredentialDto: CreateCredentialDto) {
    const findUser = await this.usersService.getUserById(
      createCredentialDto.userId,
    );

    if (!findUser) {
      throw new NotFoundException('User not found!');
    }

    if (createCredentialDto.userId !== user.id) {
      throw new ForbiddenException("You can't create this credential!");
    }

    const encryptedPassword = await this.encryptPassword(
      createCredentialDto.encryptedPassword,
    );
    const newCredential = new Credential(
      createCredentialDto.title,
      createCredentialDto.url,
      createCredentialDto.username,
      encryptedPassword,
      user.id,
    );
    return this.credentialsRepository.createCredential(newCredential);
  }

  async findAll(user: User) {
    const credentials =
      await this.credentialsRepository.findAllCredentials(user);

    const decryptedCredentials = await Promise.all(
      credentials.map(async (c) => {
        const decryptedPassword = await this.decryptPassword(
          c.encryptedPassword,
        );
        return { ...c, encryptedPassword: decryptedPassword };
      }),
    );

    return decryptedCredentials;
  }

  async findOne(id: number, user: User) {
    const credential = await this.credentialErrors(id, user);
    credential.encryptedPassword = await this.decryptPassword(
      credential.encryptedPassword,
    );
    return credential;
  }

  async remove(id: number, user: User) {
    await this.credentialErrors(id, user);
    return this.credentialsRepository.deleteCredentialById(id);
  }

  async deleteAllByUserId(id: number) {
    return this.credentialsRepository.deleteAll(id);
  }

  private async credentialErrors(id: number, user: User) {
    const credential = await this.credentialsRepository.findCredentialById(id);

    if (!credential) {
      throw new NotFoundException('Credential not found!');
    }

    if (credential && credential.userId !== user.id) {
      throw new ForbiddenException("This credential doesn't belong to you!");
    }

    return credential;
  }

  async encryptPassword(password: string) {
    const cryptr = new Cryptr('myTotallySecretKey');
    const encryptedPassword = cryptr.encrypt(password);

    return encryptedPassword;
  }

  async decryptPassword(password: string) {
    const cryptr = new Cryptr('myTotallySecretKey');
    const decryptedPassword = cryptr.decrypt(password);

    return decryptedPassword;
  }
}
