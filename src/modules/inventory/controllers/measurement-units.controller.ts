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
import { InventoryService } from '../services/inventory.service';
import { CreateMeasurementUnitDto } from '../dto/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../dto/update-measurement-unit.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolNombre } from '../../../database/schema/auth/roles.schema';

@Controller('measurement-units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeasurementUnitsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.VETERINARIO, RolNombre.RECEPCIONISTA)
  findAll() {
    return this.inventoryService.findAllMeasurementUnits();
  }

  @Post()
  @Roles(RolNombre.ADMINISTRADOR)
  create(@Body() dto: CreateMeasurementUnitDto) {
    return this.inventoryService.createMeasurementUnit(dto);
  }

  @Get(':id')
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.VETERINARIO, RolNombre.RECEPCIONISTA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findMeasurementUnitById(id);
  }

  @Patch(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeasurementUnitDto,
  ) {
    return this.inventoryService.updateMeasurementUnit(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.desactivarMeasurementUnit(id);
  }
}