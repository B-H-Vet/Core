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
import { CreateSupplyDto } from '../dto/create-supply.dto';
import { FindAllSuppliesResponseDto } from '../dto/find-all-supplies-response.dto';
import { FindSupplyByIdResponseDto } from '../dto/find-supply-by-id-response.dto';
import { UpdateSupplyDto } from '../dto/update-supply.dto';
import { SuppliesService } from '../services/supplies.service';

@Controller('supplies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findAll(): Promise<FindAllSuppliesResponseDto[]> {
    return this.suppliesService.findAll();
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateSupplyDto): Promise<FindSupplyByIdResponseDto> {
    return this.suppliesService.create(dto);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.RECEPCIONISTA,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindSupplyByIdResponseDto> {
    return this.suppliesService.findById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplyDto,
  ): Promise<FindSupplyByIdResponseDto> {
    return this.suppliesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliesService.delete(id);
  }
}
