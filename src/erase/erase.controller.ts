import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EraseService } from './erase.service';
import { CreateEraseDto } from './dto/create-erase.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('erase')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Post()
  @ApiOperation({ summary: 'Delete all infos from user by correct password' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Delete all cards, credentials, notes and session that belongs to the corresponding user',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  erase(@Body() createEraseDto: CreateEraseDto, @User() user: UserPrisma) {
    return this.eraseService.eraseAccount(user, createEraseDto);
  }
}
