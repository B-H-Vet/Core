import {
  Controller,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UsersService } from '../../services/users.service';

@Controller('admin/user-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL_NOMBRES.ADMINISTRADOR)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/approve')
  aprobarCuenta(
    @Param('id', ParseIntPipe) id: number,

    @CurrentUser()
    user: { id: number; email: string; rol: string },
  ) {
    return this.usersService.aprobarCuenta(id, user.id);
  }

  @Patch(':id/revoke')
  revocarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser()
    user: { id: number; email: string; rol: string },
  ) {
    return this.usersService.desactivarCuenta(id, user.id);
  }
}
