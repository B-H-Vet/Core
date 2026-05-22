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
} from '@nestjs/common';
import { PetsService } from '../services/pets.service';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';


@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get(':clientId/pets')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA, ROL_NOMBRES.VETERINARIO, ROL_NOMBRES.CLIENTE)
  findByClientId(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.petsService.findByClientId(clientId);
  }

  @Post(':clientId/pets')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  create(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() dto: CreatePetDto,
  ) {
    return this.petsService.create(clientId, dto);
  }

  @Get()
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA, ROL_NOMBRES.VETERINARIO)
  findAll() {
    return this.petsService.findAll();
  }

  @Get(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA, ROL_NOMBRES.VETERINARIO, ROL_NOMBRES.CLIENTE)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.findById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePetDto,
  ) {
    return this.petsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.delete(id);
  }
}