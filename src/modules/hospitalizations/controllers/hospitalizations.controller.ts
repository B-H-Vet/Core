import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateEvolutionNoteDto } from '../dto/create-evolution-note.dto';
import { CreateHospitalizationDto } from '../dto/create-hospitalization.dto';
import { DischargeHospitalizationDto } from '../dto/discharge-hospitalization.dto';
import { HospitalizationsService } from '../services/hospitalizations.service';

@Controller('hospitalizations')
export class HospitalizationsController {
  constructor(
    private readonly hospitalizationsService: HospitalizationsService,
  ) {}

  @Post()
  create(@Body() dto: CreateHospitalizationDto) {
    return this.hospitalizationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.hospitalizationsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.hospitalizationsService.findById(id);
  }

  @Get('pet/:petId')
  findByPetId(@Param('petId', ParseIntPipe) petId: number) {
    return this.hospitalizationsService.findByPetId(petId);
  }

  @Post(':id/evolution-notes')
  createEvolutionNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEvolutionNoteDto,
  ) {
    return this.hospitalizationsService.createEvolutionNote(id, dto);
  }

  @Patch(':id/discharge')
  discharge(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DischargeHospitalizationDto,
  ) {
    return this.hospitalizationsService.discharge(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.hospitalizationsService.delete(id);
  }
}
