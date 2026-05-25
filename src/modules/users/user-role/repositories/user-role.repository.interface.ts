import type { Role } from '../../../../database/schema/auth/roles.schema';
import type { UserRole } from '../../../../database/schema/auth/user-roles.schema';

export interface UserRoleWithRole {
  id: number;
  user_id: string;
  role_id: number;
  assigned_at: Date;
  approved_at: Date | null;
  approved_by: string | null;
  revoked_at: Date | null;
  revoked_by: string | null;
  role: {
    id: number;
    name: Role['name'];
    requires_approval: boolean;
  };
}

export const USER_ROLE_REPOSITORY = 'USER_ROLE_REPOSITORY';

export abstract class IUserRoleRepository {
  abstract findById(id: number): Promise<UserRoleWithRole | null>;
  abstract findByUserId(userId: string): Promise<UserRoleWithRole[]>;
  abstract findByUserIdAndRoleId(
    userId: string,
    roleId: number,
  ): Promise<UserRoleWithRole | null>;
  abstract create(userRole: {
    user: { id: string };
    role: { id: number };
  }): Promise<UserRole | null>;
  abstract update(
    userRole: Partial<UserRole> & { id: number },
  ): Promise<UserRole | null>;
  abstract revokeByUserId(userId: string, revokedBy: string): Promise<void>;
}
