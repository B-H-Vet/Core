import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import { roles } from '../../../database/schema/auth/roles.schema';

import { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {}

  async findAll(): Promise<any[]> {
    return this.db.select().from(roles).where(isNull(roles.deleted_at));
  }

  async findById(id: number): Promise<any | null> {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByName(name: string): Promise<any | null> {
    const result = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name as any))
      .limit(1);
    return result[0] ?? null;
  }

  async create(role: any): Promise<any> {
    await this.db.insert(roles).values(role);
    return this.findByName(role.name);
  }

  async update(role: any): Promise<any> {
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
