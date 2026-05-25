import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CurrentUserPayload } from '../../../common/types/current-user.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
import { MedicalRecordsService } from '../services/medical-records.service';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(
    @Body() dto: CreateMedicalRecordDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    return this.medicalRecordsService.create(dto, user, req);
  }

  @Get()
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.medicalRecordsService.findAll(user);
  }

  @Get('pet/:petId')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findByPetId(
    @Param('petId', ParseIntPipe) petId: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.medicalRecordsService.findByPetId(petId, user);
  }

  @Get(':id')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.medicalRecordsService.findById(id, user);
  }

  @Patch(':id')
  @Roles('VETERINARIO', 'ADMINISTRADOR')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: Request,
  ) {
    return this.medicalRecordsService.update(id, dto, user, req);
  }

  @Get('vaccines/expiring-soon')
  @Roles('VETERINARIO', 'RECEPCIONISTA', 'ADMINISTRADOR')
  findVaccinesExpiringSoon(@Query('days') days?: string) {
    return this.medicalRecordsService.findVaccinesExpiringSoon(
      days ? Number(days) : 30,
    );
  }
}
