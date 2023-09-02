import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new card' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create a new card for the current user.',
  })
  create(@Body() createCardDto: CreateCardDto, @User() user: UserPrisma) {
    return this.cardsService.create(user, createCardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cards by userID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all cards belonging to the current user.',
  })
  findAll(@User() user: UserPrisma) {
    return this.cardsService.findAll(user);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID to get a specific card',
    example: 8,
  })
  @ApiOperation({ summary: 'Get a specific card by userID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Get an object with the specific card that belongs to the current user.',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.cardsService.findOne(user, id);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID to delete a specific card',
    example: 8,
  })
  @ApiOperation({ summary: 'Delete a specific card by userID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Delete the specific card that belongs to the current user.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.cardsService.remove(user, id);
  }
}
