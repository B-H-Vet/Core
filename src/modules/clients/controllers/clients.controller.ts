import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateClientResponseDto } from '../dto/create-client-response.dto';
import { CreateClientDto } from '../dto/create-client.dto';
import { FindAllClientsResponseDto } from '../dto/find-all-clients-response.dto';
import { FindClientByIdResponseDto } from '../dto/find-client-by-id-response.dto';
import { UpdateClientResponseDto } from '../dto/update-client-response.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientsService } from '../services/clients.service';

interface AuthenticatedUser {
  id: string;
  email: string;
  rol: string;
  profileId: number | null;
}

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  findAll(): Promise<FindAllClientsResponseDto[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.CLIENTE,
  )
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FindClientByIdResponseDto> {
    if (user.rol === ROL_NOMBRES.CLIENTE && user.profileId !== id) {
      throw new ForbiddenException('No tienes permiso para ver este cliente');
    }
    return this.clientsService.findById(id);
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  create(@Body() dto: CreateClientDto): Promise<CreateClientResponseDto> {
    return this.clientsService.create(dto.userId, dto.phone, dto.address);
  }

  @Patch(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.CLIENTE,
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateClientResponseDto> {
    if (user.rol === ROL_NOMBRES.CLIENTE && user.profileId !== id) {
      throw new ForbiddenException(
        'No tienes permiso para editar este cliente',
      );
    }
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.delete(id);
  }
}
