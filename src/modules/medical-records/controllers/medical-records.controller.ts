import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  IPetRepository,
  PET_REPOSITORY,
} from '../../pets/repositories/pet.repository.interface';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
import { MedicalRecordsService } from '../services/medical-records.service';

interface AuthenticatedUser {
  id: number;
  email: string;
  rol: string;
  profileId: number | null;
}

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,

    @Inject(PET_REPOSITORY)
    private readonly petRepository: IPetRepository,
  ) {}

  @Post()
  @Roles(ROL_NOMBRES.VETERINARIO)
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(dto);
  }

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
  )
  findAll() {
    return this.medicalRecordsService.findAll();
  }

  @Get('pet/:petId')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.CLIENTE,
  )
  async findByPetId(
    @Param('petId', ParseIntPipe) petId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.rol === ROL_NOMBRES.CLIENTE) {
      const pet = await this.petRepository.findById(petId);
      if (pet?.client.id != user.profileId) {
        throw new ForbiddenException(
          'No tienes permiso para ver este historial médico',
        );
      }
    }
    return this.medicalRecordsService.findByPetId(petId);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.CLIENTE,
  )
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const record = await this.medicalRecordsService.findById(id);
    if (user.rol === ROL_NOMBRES.CLIENTE) {
      const pet = await this.petRepository.findById(record.pet_id);
      if (pet?.client.id != user.profileId) {
        throw new ForbiddenException(
          'No tienes permiso para ver este historial médico',
        );
      }
    }
    return record;
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.VETERINARIO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, dto);
  }
}
