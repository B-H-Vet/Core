import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull, and } from 'drizzle-orm';

import type { Database } from '../../../../database/database.module';
import { DATABASE_CONNECTION } from '../../../../database/database.module';
import { roles } from '../../../../database/schema/auth/roles.schema';
import { userRoles } from '../../../../database/schema/auth/user-roles.schema';
import type { UserRole } from '../../../../database/schema/auth/user-roles.schema';
import type {
  IUserRoleRepository,
  UserRoleWithRole,
} from '../repositories/user-role.repository.interface';

@Injectable()
export class UserRoleRepository implements IUserRoleRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async findById(id: number): Promise<UserRoleWithRole | null> {
    const result = await this.db
      .select({
        id: userRoles.id,
        user_id: userRoles.user_id,
        role_id: userRoles.role_id,
        assigned_at: userRoles.assigned_at,
        approved_at: userRoles.approved_at,
        approved_by: userRoles.approved_by,
        revoked_at: userRoles.revoked_at,
        revoked_by: userRoles.revoked_by,
        role: {
          id: roles.id,
          name: roles.name,
          requires_approval: roles.requires_approval,
        },
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(eq(userRoles.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string): Promise<UserRoleWithRole[]> {
    return await this.db
      .select({
        id: userRoles.id,
        user_id: userRoles.user_id,
        role_id: userRoles.role_id,
        assigned_at: userRoles.assigned_at,
        approved_at: userRoles.approved_at,
        approved_by: userRoles.approved_by,
        revoked_at: userRoles.revoked_at,
        revoked_by: userRoles.revoked_by,
        role: {
          id: roles.id,
          name: roles.name,
          requires_approval: roles.requires_approval,
        },
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(eq(userRoles.user_id, userId));
  }

  async findByUserIdAndRoleId(
    userId: string,
    roleId: number,
  ): Promise<UserRoleWithRole | null> {
    const result = await this.db
      .select({
        id: userRoles.id,
        user_id: userRoles.user_id,
        role_id: userRoles.role_id,
        assigned_at: userRoles.assigned_at,
        approved_at: userRoles.approved_at,
        approved_by: userRoles.approved_by,
        revoked_at: userRoles.revoked_at,
        revoked_by: userRoles.revoked_by,
        role: {
          id: roles.id,
          name: roles.name,
          requires_approval: roles.requires_approval,
        },
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.role_id, roles.id))
      .where(and(eq(userRoles.user_id, userId), eq(userRoles.role_id, roleId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(userRole: {
    user: { id: string };
    role: { id: number };
  }): Promise<UserRole | null> {
    await this.db.insert(userRoles).values({
      user_id: userRole.user.id,
      role_id: userRole.role.id,
    });
    const result = await this.db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.user_id, userRole.user.id),
          eq(userRoles.role_id, userRole.role.id),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async update(
    userRole: Partial<UserRole> & { id: number },
  ): Promise<UserRole | null> {
    await this.db
      .update(userRoles)
      .set(userRole)
      .where(eq(userRoles.id, userRole.id));
    const result = await this.db
      .select()
      .from(userRoles)
      .where(eq(userRoles.id, userRole.id))
      .limit(1);
    return result[0] ?? null;
  }

  async revokeByUserId(userId: string, revokedBy: string): Promise<void> {
    await this.db
      .update(userRoles)
      .set({
        revoked_at: new Date(),
        revoked_by: revokedBy,
      })
      .where(and(eq(userRoles.user_id, userId), isNull(userRoles.revoked_at)));
  }
}
