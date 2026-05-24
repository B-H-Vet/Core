import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import {
  AppointmentsService,
  CurrentUserPayload,
} from '../services/appointments.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('CLIENTE', 'RECEPCIONISTA', 'ADMINISTRADOR')
  create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.create(dto, user);
  }

  @Patch('confirm/:token')
  confirm(@Param('token') token: string) {
    return this.appointmentsService.confirm(token);
  }

  @Get()
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!user) {
      throw new UnauthorizedException('User is required');
    }
    return this.appointmentsService.findAll(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      },
      user,
    );
  }

  @Get(':id')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'VETERINARIO', 'ADMINISTRADOR')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.findById(id, user);
  }

  @Patch(':id/complete')
  @Roles('VETERINARIO', 'RECEPCIONISTA', 'ADMINISTRADOR')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.complete(id, user);
  }

  @Patch(':id/cancel')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'ADMINISTRADOR')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.cancel(id, dto, user);
  }

  @Patch(':id/reschedule')
  @Roles('CLIENTE', 'RECEPCIONISTA', 'ADMINISTRADOR')
  reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.reschedule(id, dto, user);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.appointmentsService.delete(id, user);
  }
}
