import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  specialties,
  type Specialty,
} from '../../../database/schema/specialties/specialties.schema';

import { ISpecialtyRepository } from './specialty.repository.interface';

@Injectable()
export class SpecialtyRepository extends ISpecialtyRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async findAll(): Promise<Specialty[]> {
    return this.db
      .select()
      .from(specialties)
      .where(isNull(specialties.deleted_at));
  }

  async findById(id: number): Promise<Specialty | null> {
    const result = (await this.db
      .select()
      .from(specialties)
      .where(and(eq(specialties.id, id), isNull(specialties.deleted_at)))
      .limit(1)) as Specialty[];
    return result[0] ?? null;
  }

  async create(specialty: Partial<Specialty>): Promise<Specialty> {
    if (!specialty.name) {
      throw new Error('Name is required');
    }
    await this.db.insert(specialties).values({
      name: specialty.name,
      description: specialty.description ?? null,
    });
    const result = (await this.db
      .select()
      .from(specialties)
      .where(eq(specialties.name, specialty.name))
      .limit(1)) as Specialty[];
    if (!result[0]) {
      throw new Error('Error al crear la especialidad');
    }
    return result[0];
  }

  async update(
    specialty: Partial<Specialty> & { id: number },
  ): Promise<Specialty> {
    await this.db
      .update(specialties)
      .set({
        name: specialty.name,
        description: specialty.description,
        is_active: specialty.is_active,
        updated_at: new Date(),
      })
      .where(eq(specialties.id, specialty.id));
    const updated = await this.findById(specialty.id);
    if (!updated) {
      throw new Error('Error al actualizar la especialidad');
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(specialties)
      .set({ deleted_at: new Date() })
      .where(eq(specialties.id, id));
  }
}
