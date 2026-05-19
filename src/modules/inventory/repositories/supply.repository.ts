import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull, lte, and, gte } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import * as schema from '../../../database/schema';
import { supplies } from '../../../database/schema/inventory/supplies.schema';
import type {
  CreateSupplyData,
  UpdateSupplyData,
  SupplyRow,
} from '../types/inventory.types';

import { ISupplyRepository } from './supply.repository.interface';

@Injectable()
export class SupplyRepository extends ISupplyRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database<typeof schema>,
  ) {
    super();
  }

  findAll(): Promise<SupplyRow[]> {
    return this.db.select().from(supplies).where(isNull(supplies.deleted_at));
  }

  async findById(id: number): Promise<SupplyRow | null> {
    const result = await this.db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    return (result[0] as SupplyRow | undefined) ?? null;
  }

  findLowStock(): Promise<SupplyRow[]> {
    return this.db.select().from(supplies).where(isNull(supplies.deleted_at));
  }

  findExpiringSoon(days: number): Promise<SupplyRow[]> {
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

  async create(supply: CreateSupplyData): Promise<SupplyRow> {
    await this.db.insert(supplies).values({
      name: supply.name,
      price: String(supply.price),
      expiring_date: supply.expiring_date,
      min_stock: supply.min_stock,
      stock: supply.stock,
      id_category: supply.category.id,
      id_measurement: supply.measurement_unit.id,
    });

    const result = await this.db
      .select()
      .from(supplies)
      .where(eq(supplies.name, supply.name))
      .limit(1);

    return result[0] as SupplyRow;
  }

  async update(supply: UpdateSupplyData): Promise<SupplyRow | null> {
    await this.db
      .update(supplies)
      .set({
        name: supply.name,
        price: supply.price !== undefined ? String(supply.price) : undefined,
        expiring_date: supply.expiring_date,
        min_stock: supply.min_stock,
        stock: supply.stock,
        id_category: supply.category?.id,
        id_measurement: supply.measurement_unit?.id,
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
