import {
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UsersService } from '../services/users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('pendientes')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  findPendientes() {
    return this.usersService.findPendientesAprobacion();
  }

  @Get()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Patch(':id/aprobar')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  aprobarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser()
    user: { id: number; email: string; rol: string },
  ) {
    return this.usersService.aprobarCuenta(id, user.id);
  }

  @Patch(':id/desactivar')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  desactivarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser()
    user: { id: number; email: string; rol: string },
  ) {
    return this.usersService.desactivarCuenta(id, user.id);
  }
}
