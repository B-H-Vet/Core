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
import { CreateSupplyDto } from '../dto/create-supply.dto';
import { UpdateSupplyDto } from '../dto/update-supply.dto';
import { InventoryService } from '../services/inventory.service';

@Controller('supplies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findAll() {
    return this.inventoryService.findAllSupplies();
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateSupplyDto) {
    return this.inventoryService.createSupply(dto);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findSupplyById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplyDto) {
    return this.inventoryService.updateSupply(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.deleteSupply(id);
  }
}
