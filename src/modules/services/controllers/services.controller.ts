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

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateServiceResponseDto } from '../dto/create-service-response.dto';
import { CreateServiceDto } from '../dto/create-service.dto';
import { DeleteServiceResponseDto } from '../dto/delete-service-response.dto';
import { GetAllServiceResponseDto } from '../dto/get-all-service-response.dto';
import { GetServiceResponseDto } from '../dto/get-service-response.dto';
import { UpdateServiceResponseDto } from '../dto/update-service-response.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { ServicesService } from '../services/services.service';

interface AuthenticatedUser {
  id: string;
  email: string;
  rol: string;
  profileId: number | null;
}

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(
    ROL_NOMBRES.ADMINISTRADOR,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.CLIENTE,
  )
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetAllServiceResponseDto[]> {
    return this.servicesService.findAll(user.rol);
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
  ): Promise<GetServiceResponseDto> {
    return this.servicesService.findById(id, user.rol);
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CreateServiceResponseDto> {
    return this.servicesService.create(dto, user.id, user.rol);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateServiceResponseDto> {
    return this.servicesService.update(id, dto, user.id, user.rol);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DeleteServiceResponseDto> {
    return this.servicesService.delete(id, user.id, user.rol);
  }
}
