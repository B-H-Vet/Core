import type { Role } from '../../../../database/schema/auth/roles.schema';
import type { UserRole } from '../../../../database/schema/auth/user-roles.schema';

export interface UserRoleWithRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_at: Date;
  approved_at: Date | null;
  approved_by: number | null;
  revoked_at: Date | null;
  revoked_by: number | null;
  role: {
    id: number;
    name: Role['name'];
    requires_approval: boolean;
  };
}

export const USER_ROLE_REPOSITORY = 'USER_ROLE_REPOSITORY';

export abstract class IUserRoleRepository {
  abstract findByUserId(userId: number): Promise<UserRoleWithRole[]>;
  abstract findByUserIdAndRoleId(
    userId: number,
    roleId: number,
  ): Promise<UserRole | null>;
  abstract create(userRole: {
    user: { id: number };
    role: { id: number };
  }): Promise<UserRole | null>;
  abstract update(
    userRole: Partial<UserRole> & { id: number },
  ): Promise<UserRole | null>;
  abstract revokeByUserId(userId: number, revokedBy: number): Promise<void>;
}
