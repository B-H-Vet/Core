import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  hospitalizations,
  type EgressStatus,
  type Hospitalization,
} from '../../../database/schema/hospitalizations/hospitalizations.schema';

import { IHospitalizationRepository } from './hospitalization.repository.interface';

@Injectable()
export class HospitalizationRepository extends IHospitalizationRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(petId: number): Promise<Hospitalization> {
    await this.db.insert(hospitalizations).values({
      pet_id: petId,
      admission_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(hospitalizations)
      .where(
        and(
          eq(hospitalizations.pet_id, petId),
          isNull(hospitalizations.egress_date),
          isNull(hospitalizations.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new Error('Error al crear la hospitalización');
    }

    return result[0];
  }

  async findAll(): Promise<Hospitalization[]> {
    return this.db
      .select()
      .from(hospitalizations)
      .where(isNull(hospitalizations.deleted_at));
  }

  async findById(id: number): Promise<Hospitalization | null> {
    const result = await this.db
      .select()
      .from(hospitalizations)
      .where(
        and(eq(hospitalizations.id, id), isNull(hospitalizations.deleted_at)),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findByPetId(petId: number): Promise<Hospitalization[]> {
    return this.db
      .select()
      .from(hospitalizations)
      .where(
        and(
          eq(hospitalizations.pet_id, petId),
          isNull(hospitalizations.deleted_at),
        ),
      );
  }

  async findActiveByPetId(petId: number): Promise<Hospitalization | null> {
    const result = await this.db
      .select()
      .from(hospitalizations)
      .where(
        and(
          eq(hospitalizations.pet_id, petId),
          isNull(hospitalizations.egress_date),
          isNull(hospitalizations.deleted_at),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async discharge(data: {
    id: number;
    egress_status: EgressStatus;
  }): Promise<Hospitalization> {
    await this.db
      .update(hospitalizations)
      .set({
        egress_date: new Date(),
        egress_status: data.egress_status,
        updated_at: new Date(),
      })
      .where(eq(hospitalizations.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new Error('Error al actualizar la hospitalización');
    }

    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(hospitalizations)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(hospitalizations.id, id));
  }
}
