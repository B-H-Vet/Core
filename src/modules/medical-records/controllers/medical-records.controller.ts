import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { MedicalRecordsService } from '../services/medical-records.service';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  @Post()
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(dto);
  }

  @Get()
  findAll() {
    return this.medicalRecordsService.findAll();
  }

  @Get('pet/:petId')
  findByPetId(@Param('petId', ParseIntPipe) petId: number) {
    return this.medicalRecordsService.findByPetId(petId);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.medicalRecordsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, dto);
  }
}