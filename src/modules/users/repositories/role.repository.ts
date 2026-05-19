import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';

import type { Database } from '../../../database/database.module';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { roles } from '../../../database/schema/auth/roles.schema';
import type {
  Role,
  NewRole,
  RolNombre,
} from '../../../database/schema/auth/roles.schema';

import type { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.db.select().from(roles).where(isNull(roles.deleted_at));
  }

  async findById(id: number): Promise<Role | null> {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByName(name: RolNombre): Promise<Role | null> {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    return result[0] ?? null;
  }

  async create(role: NewRole): Promise<Role | null> {
    await this.db.insert(roles).values(role);
    return this.findByName(role.name);
  }

  async update(role: Role): Promise<Role | null> {
    await this.db.update(roles).set(role).where(eq(roles.id, role.id));
    return this.findById(role.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(roles)
      .set({ deleted_at: new Date() })
      .where(eq(roles.id, id));
  }
}
