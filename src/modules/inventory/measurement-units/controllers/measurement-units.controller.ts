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
import { CreateMeasurementUnitDto } from '../dto/create-measurement-unit.dto';
import { FindAllMeasurementUnitsResponseDto } from '../dto/find-all-measurement-units-response.dto';
import { FindMeasurementUnitByIdResponseDto } from '../dto/find-measurement-unit-by-id-response.dto';
import { UpdateMeasurementUnitDto } from '../dto/update-measurement-unit.dto';
import { MeasurementUnitsService } from '../services/measurement-units.service';

@Controller('measurement-units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeasurementUnitsController {
  constructor(
    private readonly measurementUnitsService: MeasurementUnitsService,
  ) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findAll(): Promise<FindAllMeasurementUnitsResponseDto[]> {
    return this.measurementUnitsService.findAll();
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(
    @Body() dto: CreateMeasurementUnitDto,
  ): Promise<FindMeasurementUnitByIdResponseDto> {
    return this.measurementUnitsService.create(dto);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindMeasurementUnitByIdResponseDto> {
    return this.measurementUnitsService.findById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeasurementUnitDto,
  ): Promise<FindMeasurementUnitByIdResponseDto> {
    return this.measurementUnitsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.measurementUnitsService.desactivar(id);
  }
}
