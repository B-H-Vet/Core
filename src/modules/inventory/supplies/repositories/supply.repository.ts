import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull, lte, and, gte } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../../database/database.module';
import * as schema from '../../../../database/schema';
import { supplies } from '../../../../database/schema/inventory/supplies.schema';
import {
  CreateSupplyInput,
  UpdateSupplyInput,
  SupplyEntity,
} from '../types/supply.types';

import { ISupplyRepository } from './supply.repository.interface';

@Injectable()
export class SupplyRepository extends ISupplyRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database<typeof schema>,
  ) {
    super();
  }

  findAll(): Promise<SupplyEntity[]> {
    return this.db.select().from(supplies).where(isNull(supplies.deleted_at));
  }

  async findById(id: number): Promise<SupplyEntity | null> {
    const result = await this.db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    return (result[0] as SupplyEntity | undefined) ?? null;
  }

  findLowStock(): Promise<SupplyEntity[]> {
    return this.db.select().from(supplies).where(isNull(supplies.deleted_at));
  }

  findExpiringSoon(days: number): Promise<SupplyEntity[]> {
    const today = new Date();
    const limit = new Date();

    limit.setDate(today.getDate() + days);

    return this.db
      .select()
      .from(supplies)
      .where(
        and(
          gte(supplies.expiring_date, today),
          lte(supplies.expiring_date, limit),
          isNull(supplies.deleted_at),
        ),
      );
  }

  async create(supply: CreateSupplyInput): Promise<SupplyEntity> {
    await this.db.insert(supplies).values({
      name: supply.name,
      price: String(supply.price),
      expiring_date: supply.expiring_date,
      min_stock: supply.min_stock,
      stock: supply.stock,
      id_category: supply.id_category,
      id_measurement: supply.id_measurement,
    });

    const result = await this.db
      .select()
      .from(supplies)
      .where(eq(supplies.name, supply.name))
      .limit(1);

    return result[0] as SupplyEntity;
  }

  async update(supply: UpdateSupplyInput): Promise<SupplyEntity | null> {
    await this.db
      .update(supplies)
      .set({
        name: supply.name,
        price: supply.price,
        expiring_date: supply.expiring_date,
        min_stock: supply.min_stock,
        stock: supply.stock,
        id_category: supply.id_category,
        id_measurement: supply.id_measurement,
        updated_at: new Date(),
      })
      .where(eq(supplies.id, supply.id));

    return this.findById(supply.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(supplies)
      .set({ deleted_at: new Date() })
      .where(eq(supplies.id, id));
  }
}
