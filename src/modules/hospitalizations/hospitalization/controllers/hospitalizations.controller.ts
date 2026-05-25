import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateHospitalizationResponseDto } from '../dto/create-hospitalization-response.dto';
import { CreateHospitalizationDto } from '../dto/create-hospitalization.dto';
import { DeleteHospitalizationResponseDto } from '../dto/delete-hospitalization-response.dto';
import { DischargeHospitalizationResponseDto } from '../dto/discharge-hospitalization-response.dto';
import { DischargeHospitalizationDto } from '../dto/discharge-hospitalization.dto';
import { FindAllHospitalizationsResponseDto } from '../dto/find-all-hospitalizations-response.dto';
import { FindHospitalizationByIdResponseDto } from '../dto/find-hospitalization-by-id-response.dto';
import { FindHospitalizationsByPetIdResponseDto } from '../dto/find-hospitalizations-by-pet-id-response.dto';
import { HospitalizationsService } from '../services/hospitalizations.service';

interface AuthenticatedUser {
  id: string;
  rol: string;
}

@Controller('hospitalizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalizationsController {
  constructor(
    private readonly hospitalizationsService: HospitalizationsService,
  ) {}

  @Post()
  @Roles(ROL_NOMBRES.VETERINARIO)
  create(
    @Body() dto: CreateHospitalizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CreateHospitalizationResponseDto> {
    return this.hospitalizationsService.create(dto, user);
  }

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.CLIENTE,
  )
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FindAllHospitalizationsResponseDto> {
    return this.hospitalizationsService.findAll(user.rol, user.id);
  }

  @Get(':id')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.CLIENTE,
  )
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FindHospitalizationByIdResponseDto> {
    return this.hospitalizationsService.findById(id, user.rol, user.id);
  }

  @Get('pet/:petId')
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.CLIENTE,
  )
  findByPetId(
    @Param('petId', ParseIntPipe) petId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FindHospitalizationsByPetIdResponseDto> {
    return this.hospitalizationsService.findByPetId(petId, user.rol, user.id);
  }

  @Patch(':id/discharge')
  @Roles(ROL_NOMBRES.ADMINISTRADOR, ROL_NOMBRES.VETERINARIO)
  discharge(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DischargeHospitalizationDto,
  ): Promise<DischargeHospitalizationResponseDto> {
    return this.hospitalizationsService.discharge(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteHospitalizationResponseDto> {
    return this.hospitalizationsService.delete(id);
  }
}
