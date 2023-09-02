import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Post to create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'New user' })
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signup(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login and return a token',
  })
  @HttpCode(HttpStatus.OK)
  login(@Body() createSessionDto: CreateSessionDto) {
    return this.usersService.login(
      createSessionDto.email,
      createSessionDto.password,
    );
  }
}
