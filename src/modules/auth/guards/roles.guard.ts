import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RolNombre } from '../../../database/schema/auth/roles.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolNombre[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequeridos.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{
      user: { rol: RolNombre };
    }>();

    if (!rolesRequeridos.includes(user.rol)) {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para acceder a este módulo',
      );
    }

    return true;
  }
}
