import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';

import type { Database } from '../../../../database/database.module';
import { DATABASE_CONNECTION } from '../../../../database/database.module';
import {
  users,
  type NewUser,
  User,
} from '../../../../database/schema/auth/users.schema';

import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository extends IUserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async findAll(): Promise<User[]> {
    return await this.db.select().from(users).where(isNull(users.deleted_at));
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async create(user: NewUser): Promise<User | null> {
    await this.db.insert(users).values(user);
    return this.findByEmail(user.email);
  }

  async update(user: User): Promise<User | null> {
    await this.db.update(users).set(user).where(eq(users.id, user.id));
    return this.findById(user.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(users)
      .set({ deleted_at: new Date() })
      .where(eq(users.id, id));
  }
}
