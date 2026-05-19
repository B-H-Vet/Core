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
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolNombre } from '../../../database/schema/auth/roles.schema';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.VETERINARIO, RolNombre.RECEPCIONISTA)
  findAll() {
    return this.inventoryService.findAllCategories();
  }

  @Post()
  @Roles(RolNombre.ADMINISTRADOR)
  create(@Body() dto: CreateCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get(':id')
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.VETERINARIO, RolNombre.RECEPCIONISTA)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findCategoryById(id);
  }

  @Patch(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.desactivarCategory(id);
  }
}