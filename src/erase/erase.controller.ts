import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EraseService } from './erase.service';
import { CreateEraseDto } from './dto/create-erase.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) { }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  erase(@Body() createEraseDto: CreateEraseDto, @User() user: UserPrisma) {
    return this.eraseService.eraseAccount(user, createEraseDto);
  }
}
