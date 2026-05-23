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
  id: number;
  role: string;
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
    return this.servicesService.findAll(user.role);
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
    return this.servicesService.findById(id, user.role);
  }

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  create(@Body() dto: CreateServiceDto): Promise<CreateServiceResponseDto> {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<UpdateServiceResponseDto> {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteServiceResponseDto> {
    return this.servicesService.delete(id);
  }
}
