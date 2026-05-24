import {
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserService } from '../services/user.service';

interface AuthenticatedUser {
  id: number;
  email: string;
  rol: string;
  profileId: number | null;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('pendientes')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  findPendientes() {
    return this.userService.findPendientesAprobacion();
  }

  @Get()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id/aprobar')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  aprobarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.userService.aprobarCuenta(id, user.id);
  }

  @Patch(':id/desactivar')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  desactivarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.userService.desactivarCuenta(id, user.id);
  }
}
