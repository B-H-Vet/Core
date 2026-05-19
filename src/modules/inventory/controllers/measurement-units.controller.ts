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

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateMeasurementUnitDto } from '../dto/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../dto/update-measurement-unit.dto';
import { InventoryService } from '../services/inventory.service';

@Controller('measurement-units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeasurementUnitsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findAll() {
    return this.inventoryService.findAllMeasurementUnits();
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateMeasurementUnitDto) {
    return this.inventoryService.createMeasurementUnit(dto);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findMeasurementUnitById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeasurementUnitDto,
  ) {
    return this.inventoryService.updateMeasurementUnit(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.desactivarMeasurementUnit(id);
  }
}
