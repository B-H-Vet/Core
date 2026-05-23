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

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateSpecialtyResponseDto } from '../dto/create-specialty-response.dto';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { DeleteSpecialtyResponseDto } from '../dto/delete-specialty-response.dto';
import { FindAllSpecialtiesResponseDto } from '../dto/find-all-specialties-response.dto';
import { FindSpecialtyByIdResponseDto } from '../dto/find-specialty-by-id-response.dto';
import { UpdateSpecialtyResponseDto } from '../dto/update-specialty-response.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';
import { SpecialtiesService } from '../services/specialties.service';

@Controller('specialties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
  )
  findAll(): Promise<FindAllSpecialtiesResponseDto[]> {
    return this.specialtiesService.findAll();
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
  )
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindSpecialtyByIdResponseDto> {
    return this.specialtiesService.findById(id);
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateSpecialtyDto): Promise<CreateSpecialtyResponseDto> {
    return this.specialtiesService.create(dto);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpecialtyDto,
  ): Promise<UpdateSpecialtyResponseDto> {
    return this.specialtiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteSpecialtyResponseDto> {
    return this.specialtiesService.delete(id);
  }
}
