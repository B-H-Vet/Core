import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RolNombre } from '../../../database/schema/auth/roles.schema';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const rolesRequeridos = this.reflector.getAllAndOverride<RolNombre[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!Array.isArray(rolesRequeridos) || !rolesRequeridos.length) {
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
