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
import { CreateSupplyDto } from '../dto/create-supply.dto';
import { UpdateSupplyDto } from '../dto/update-supply.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolNombre } from '../../../database/schema/auth/roles.schema';

@Controller('supplies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.VETERINARIO, RolNombre.RECEPCIONISTA)
  findAll() {
    return this.inventoryService.findAllSupplies();
  }

  @Post()
  @Roles(RolNombre.ADMINISTRADOR)
  create(@Body() dto: CreateSupplyDto) {
    return this.inventoryService.createSupply(dto);
  }

  @Get(':id')
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.VETERINARIO, RolNombre.RECEPCIONISTA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findSupplyById(id);
  }

  @Patch(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplyDto,
  ) {
    return this.inventoryService.updateSupply(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.deleteSupply(id);
  }
}