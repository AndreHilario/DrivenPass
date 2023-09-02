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
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
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

@ApiTags('credentials')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new credential' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create a new credential for the current user.',
  })
  create(
    @Body() createCredentialDto: CreateCredentialDto,
    @User() user: UserPrisma,
  ) {
    return this.credentialsService.create(user, createCredentialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credentials by userID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all credentials belonging to the current user.',
  })
  findAll(@User() user: UserPrisma) {
    return this.credentialsService.findAll(user);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID to get a specific credential',
    example: 8,
  })
  @ApiOperation({ summary: 'Get a specific credential by userID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get an object with the specific credential that belongs to the current user.',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.credentialsService.findOne(id, user);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID to delete a specific credential',
    example: 8,
  })
  @ApiOperation({ summary: 'Delete a specific credential by userID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Delete the specific credential that belongs to the current user.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @User() user: UserPrisma) {
    return this.credentialsService.remove(id, user);
  }
}

