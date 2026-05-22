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
import { CreateCategoryDto } from '../dto/create-category.dto';
import { FindAllCategoriesResponseDto } from '../dto/find-all-categories-response.dto';
import { FindCategoryByIdResponseDto } from '../dto/find-category-by-id-response.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findAll(): Promise<FindAllCategoriesResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateCategoryDto): Promise<FindCategoryByIdResponseDto> {
    return this.categoriesService.create(dto);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindCategoryByIdResponseDto> {
    return this.categoriesService.findById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<FindCategoryByIdResponseDto> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.desactivar(id);
  }
}
