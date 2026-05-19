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
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { InventoryService } from '../services/inventory.service';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findAll() {
    return this.inventoryService.findAllCategories();
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findCategoryById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.desactivarCategory(id);
  }
}
