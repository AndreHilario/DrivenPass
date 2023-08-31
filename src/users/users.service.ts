import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UsersService {

  private EXPIRES_IN = "7 days";
  private ISSUER = "DrivenPass";
  private AUDIENCE = "users";

  constructor
    (
      private readonly usersRepository: UsersRepository,
      private readonly jwtService: JwtService
    ) { }

  async signup(createUserDto: CreateUserDto) {
    const email = await this.usersRepository.findUserByEmail(createUserDto.email);

    if (email) throw new ConflictException("E-mail already in use");

    const hashPassword = bcrypt.hashSync(createUserDto.password, 10);
    const newUser = new Users(createUserDto.email, hashPassword);
    return this.usersRepository.createUser(newUser);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) throw new UnauthorizedException("Email or password invalid!");

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException("Email or password invalid!");

    const token = this.createToken(user);

    const session = await this.usersRepository.createSession(token, user.id);
    return {
      token: session.token
    };
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) throw new NotFoundException("User not found!");

    return user;
  }

  private createToken(user: User) {
    const { id, email } = user;

    const token = this.jwtService.sign({ email }, {
      expiresIn: this.EXPIRES_IN,
      subject: String(id),
      issuer: this.ISSUER,
      audience: this.AUDIENCE

    });

    return token;
  }

  checkToken(token: string) {
    const data = this.jwtService.verify(token, {
      audience: this.AUDIENCE,
      issuer: this.ISSUER
    });

    return data;
  }

  async deleteUserAndSession(id: number) {
    await this.usersRepository.deleteSession(id);
    return this.usersRepository.deleteUser(id);
  }
}
