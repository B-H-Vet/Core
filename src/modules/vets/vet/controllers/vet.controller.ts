import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { DeleteVetResponseDto } from '../dto/delete-vet-response.dto';
import { FindAllVetsResponseDto } from '../dto/find-all-vets-response.dto';
import { FindVetByIdResponseDto } from '../dto/find-vet-by-id-response.dto';
import { UpdateVetResponseDto } from '../dto/update-vet-response.dto';
import { UpdateVetDto } from '../dto/update-vet.dto';
import { VetService } from '../services/vet.service';

@Controller('vets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VetController {
  constructor(private readonly vetService: VetService) {}

  @Get()
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<FindAllVetsResponseDto> {
    return this.vetService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.RECEPCIONISTA)
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindVetByIdResponseDto> {
    return this.vetService.findById(id);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVetDto,
  ): Promise<UpdateVetResponseDto> {
    return this.vetService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteVetResponseDto> {
    return this.vetService.update(id, { is_active: false });
  }
}
