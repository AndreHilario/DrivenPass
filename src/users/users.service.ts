import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';


@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async signup(createUserDto: CreateUserDto) {
    const email = await this.usersRepository.findUserByEmail(createUserDto.email);

    if (email) throw new ConflictException("E-mail already in use");

    const hashPassword = bcrypt.hashSync(createUserDto.password, 10);
    const newUser = new User(createUserDto.email, hashPassword);
    return this.usersRepository.createUser(newUser);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findUserByEmail(email);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) throw new UnauthorizedException("User unauthorized!");

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const session = await this.usersRepository.createSession(token, user.id);
    return {
      acess_token: session.token
    };
  }
}
