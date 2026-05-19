import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { measurementUnits } from '../../../database/schema/inventory/measurement-units.schema';
import { IMeasurementUnitRepository } from './measurement-unit.repository.interface';

@Injectable()
export class MeasurementUnitRepository extends IMeasurementUnitRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {
    super();
  }

  async findAll(): Promise<any[]> {
    return this.db
      .select()
      .from(measurementUnits)
      .where(isNull(measurementUnits.deleted_at));
  }

  async findById(id: number): Promise<any | null> {
    const result = await this.db
      .select()
      .from(measurementUnits)
      .where(eq(measurementUnits.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(unit: any): Promise<any> {
    await this.db.insert(measurementUnits).values({ unit: unit.unit });
    const result = await this.db
      .select()
      .from(measurementUnits)
      .where(eq(measurementUnits.unit, unit.unit))
      .limit(1);
    return result[0];
  }

  async update(unit: any): Promise<any> {
    await this.db
      .update(measurementUnits)
      .set({ unit: unit.unit, updated_at: new Date() })
      .where(eq(measurementUnits.id, unit.id));
    return this.findById(unit.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(measurementUnits)
      .set({ deleted_at: new Date() })
      .where(eq(measurementUnits.id, id));
  }
}