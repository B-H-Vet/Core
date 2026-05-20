import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import * as schema from '../../../database/schema';
import { users } from '../../../database/schema/auth/users.schema';
import { clients } from '../../../database/schema/clients/clients.schema';

import {
  IClientRepository,
  ClientWithUser,
} from './client.repository.interface';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  async findAll(): Promise<ClientWithUser[]> {
    return await this.db
      .select({
        id: clients.id,
        phone: clients.phone,
        address: clients.address,
        is_active: clients.is_active,
        created_at: clients.created_at,
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(clients)
      .innerJoin(users, eq(clients.user_id, users.id))
      .where(isNull(clients.deleted_at));
  }

  async findById(id: number): Promise<ClientWithUser | null> {
    const result = await this.db
      .select({
        id: clients.id,
        phone: clients.phone,
        address: clients.address,
        is_active: clients.is_active,
        created_at: clients.created_at,
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(clients)
      .innerJoin(users, eq(clients.user_id, users.id))
      .where(eq(clients.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByUserId(userId: number): Promise<ClientWithUser | null> {
    const result = await this.db
      .select({
        id: clients.id,
        phone: clients.phone,
        address: clients.address,
        is_active: clients.is_active,
        created_at: clients.created_at,
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(clients)
      .innerJoin(users, eq(clients.user_id, users.id))
      .where(eq(clients.user_id, userId))
      .limit(1);

    return result[0] ?? null;
  }

  async create(client: {
    user: { id: number };
    phone: string;
    address?: string;
  }): Promise<ClientWithUser> {
    await this.db.insert(clients).values({
      user_id: client.user.id,
      phone: client.phone,
      address: client.address,
    });

    const createdClient = await this.findByUserId(client.user.id);

    if (!createdClient) {
      throw new Error();
    }

    return createdClient;
  }

  async update(client: ClientWithUser): Promise<ClientWithUser> {
    await this.db
      .update(clients)
      .set({
        phone: client.phone,
        address: client.address,
        is_active: client.is_active,
        updated_at: new Date(),
      })
      .where(eq(clients.id, client.id));

    const updatedClient = await this.findById(client.id);

    if (!updatedClient) {
      throw new Error();
    }

    return updatedClient;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(clients)
      .set({
        deleted_at: new Date(),
      })
      .where(eq(clients.id, id));
  }
}
