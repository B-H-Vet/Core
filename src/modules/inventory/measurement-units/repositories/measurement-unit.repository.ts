import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../../database/database.module';
import * as schema from '../../../../database/schema';
import { measurementUnits } from '../../../../database/schema/inventory/measurement-units.schema';
import {
  MeasurementUnitEntity,
  CreateMeasurementUnitData,
  UpdateMeasurementUnitData,
} from '../types/measurement-unit.types';

import { IMeasurementUnitRepository } from './measurement-unit.repository.interface';

@Injectable()
export class MeasurementUnitRepository extends IMeasurementUnitRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database<typeof schema>,
  ) {
    super();
  }

  findAll(): Promise<MeasurementUnitEntity[]> {
    return this.db
      .select()
      .from(measurementUnits)
      .where(isNull(measurementUnits.deleted_at));
  }

  async findById(id: number): Promise<MeasurementUnitEntity | null> {
    const result = await this.db
      .select()
      .from(measurementUnits)
      .where(eq(measurementUnits.id, id))
      .limit(1);

    return (result[0] as MeasurementUnitEntity | undefined) ?? null;
  }

  async create(
    unit: CreateMeasurementUnitData,
  ): Promise<MeasurementUnitEntity> {
    await this.db.insert(measurementUnits).values({ unit: unit.unit });

    const result = await this.db
      .select()
      .from(measurementUnits)
      .where(eq(measurementUnits.unit, unit.unit))
      .limit(1);

    return result[0] as MeasurementUnitEntity;
  }

  async update(
    unit: UpdateMeasurementUnitData,
  ): Promise<MeasurementUnitEntity | null> {
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
