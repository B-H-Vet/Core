import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull, lte, and, gte } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { supplies } from '../../../database/schema/inventory/supplies.schema';
import { ISupplyRepository } from './supply.repository.interface';

@Injectable()
export class SupplyRepository extends ISupplyRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {
    super();
  }

  async findAll(): Promise<any[]> {
    return this.db
      .select()
      .from(supplies)
      .where(isNull(supplies.deleted_at));
  }

  async findById(id: number): Promise<any | null> {
    const result = await this.db
      .select()
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findLowStock(): Promise<any[]> {
    return this.db
      .select()
      .from(supplies)
      .where(isNull(supplies.deleted_at));
  }

  async findExpiringSoon(days: number): Promise<any[]> {
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

  async create(supply: any): Promise<any> {
    await this.db.insert(supplies).values({
      name: supply.name,
      price: supply.price,
      expiring_date: supply.expiring_date,
      min_stock: supply.min_stock ?? 0,
      stock: supply.stock ?? 0,
      id_category: supply.category.id,
      id_measurement: supply.measurement_unit.id,
    });
    const result = await this.db
      .select()
      .from(supplies)
      .where(eq(supplies.name, supply.name))
      .limit(1);
    return result[0];
  }

  async update(supply: any): Promise<any> {
    await this.db
      .update(supplies)
      .set({
        name: supply.name,
        price: supply.price,
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