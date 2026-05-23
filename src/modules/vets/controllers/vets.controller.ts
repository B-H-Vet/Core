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
import { CreateVetDto } from '../dto/create-vet.dto';
import { UpdateVetDto } from '../dto/update-vet.dto';
import { VetResponseDto } from '../dto/vet-response.dto';
import { VetsService } from '../services/vets.service';

@Controller('vets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Get()
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  findAll(): Promise<VetResponseDto[]> {
    return this.vetsService.findAll();
  }

  @Get(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  findById(@Param('id', ParseIntPipe) id: number): Promise<VetResponseDto> {
    return this.vetsService.findById(id);
  }

  @Post('crear/:userId')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateVetDto,
  ): Promise<VetResponseDto> {
    return this.vetsService.create(userId, dto);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVetDto,
  ): Promise<VetResponseDto> {
    return this.vetsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number): Promise<VetResponseDto> {
    return this.vetsService.update(id, { is_active: false });
  }
}
