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
import { VetsService } from '../services/vets.service';
import { CreateVetDto } from '../dto/create-vet.dto';
import { UpdateVetDto } from '../dto/update-vet.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolNombre } from '../../../database/schema/auth/roles.schema';

@Controller('vets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Get()
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.RECEPCIONISTA)
  findAll() {
    return this.vetsService.findAll();
  }

  @Get(':id')
  @Roles(RolNombre.ADMINISTRADOR, RolNombre.RECEPCIONISTA)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.vetsService.findById(id);
  }

  @Post('crear/:userId')
  @Roles(RolNombre.ADMINISTRADOR)
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateVetDto,
  ) {
    return this.vetsService.create(userId, dto);
  }


  @Delete(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vetsService.update(id, { is_active: false });
  }

  @Patch(':id')
  @Roles(RolNombre.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVetDto,
  ) {
    return this.vetsService.update(id, dto);
  }
}