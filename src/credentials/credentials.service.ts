import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { CredentialsRepository } from './credentials.repository';
import { Credential } from './entities/credential.entity';
import Cryptr from "cryptr";
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class CredentialsService {
  constructor
    (
      private readonly credentialsRepository: CredentialsRepository,
      private readonly usersRepository: UsersRepository
    ) { }

  async create(createCredentialDto: CreateCredentialDto) {
    const user = await this.usersRepository.findUserById(createCredentialDto.userId);
    //analisar depois com o userId que anda junto com o token, para ver qual a forma certa de validar aqui!
    if (!user) {
      throw new ForbiddenException("User forbidden!");
    }

    const encryptedPassword = await this.encryptPassword(createCredentialDto.encryptedPassword);
    const newCredential = new Credential
      (
        createCredentialDto.title,
        createCredentialDto.url,
        createCredentialDto.username,
        encryptedPassword,
        createCredentialDto.userId
      );
    return this.credentialsRepository.createCredential(newCredential);
  }

  async findAll() {
    const credentials = await this.credentialsRepository.findAllCredentials();

    const decryptedCredentials = await Promise.all(credentials.map(async c => {
      const decryptedPassword = await this.decryptPassword(c.encryptedPassword);
      return { ...c, encryptedPassword: decryptedPassword }; 
    }));

    return decryptedCredentials;
  }


  async findOne(id: number) {
    const credential = await this.credentialErrors(id);
    credential.encryptedPassword = await this.decryptPassword(credential.encryptedPassword);
    return credential;
  }

  async remove(id: number) {
    await this.credentialErrors(id);
    return this.credentialsRepository.deleteCredentialById(id);
  }

  private async credentialErrors(id: number) {
    const credential = await this.credentialsRepository.findCredentialById(id);

    if (!credential) {
      throw new NotFoundException("Credential not found!");
    }

   /*  if (credential  && credential.userId !== ver o id do user atual, pela session com token e etc ) {
      throw new ForbiddenException("This credential doesn't belong to you!");
    } */

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
