import type { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toDto(user: any, userRoles?: any[]): UserResponseDto {
    const rolActivo = userRoles?.find((ur: any) => !ur.revoked_at);
    return {
      id: user.id,
      email: user.email,
      email_verified_at: user.email_verified_at,
      approved_at: user.approved_at,
      created_at: user.created_at,
      rol: rolActivo?.role?.name ?? null,
    };
  }

  static toDtoList(users: any[]): UserResponseDto[] {
    return users.map((u) => this.toDto(u));
  }
}
