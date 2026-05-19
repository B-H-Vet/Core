import type { User } from '../../../database/schema/auth/users.schema';
import type { UserResponseDto } from '../dto/user-response.dto';
import type { UserRoleWithRole } from '../repositories/user-role.repository.interface';

export class UserMapper {
  static toDto(user: User, userRoles?: UserRoleWithRole[]): UserResponseDto {
    const rolActivo = userRoles?.find((ur) => !ur.revoked_at);
    return {
      id: user.id,
      email: user.email,
      email_verified_at: user.email_verified_at,
      approved_at: user.approved_at,
      created_at: user.created_at,
      rol: rolActivo?.role.name ?? null,
    };
  }

  static toDtoList(
    users: User[],
    userRolesMap: Map<number, UserRoleWithRole[]>,
  ): UserResponseDto[] {
    return users.map((u) => this.toDto(u, userRolesMap.get(u.id)));
  }
}
