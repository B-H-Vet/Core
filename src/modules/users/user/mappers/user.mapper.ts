import type { User } from '../../../../database/schema/auth/users.schema';
import type { UserRoleWithRole } from '../../user-role/repositories/user-role.repository.interface';
import type { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toDto(user: User, userRoles?: UserRoleWithRole[]): UserResponseDto {
    const rolActivo = userRoles?.find((ur) => !ur.revoked_at);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
      rol: rolActivo?.role.name ?? null,
    };
  }

  static toDtoList(
    users: User[],
    userRolesMap: Map<string, UserRoleWithRole[]>,
  ): UserResponseDto[] {
    return users.map((u) => this.toDto(u, userRolesMap.get(u.id)));
  }
}
