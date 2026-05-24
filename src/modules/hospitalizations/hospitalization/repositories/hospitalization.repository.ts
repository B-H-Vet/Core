import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../../database/database.module';
import {
  hospitalizations,
  type EgressStatus,
  type Hospitalization,
} from '../../../../database/schema/hospitalizations/hospitalizations.schema';
import { pets } from '../../../../database/schema/pets/pets.schema';

import {
  IHospitalizationRepository,
  type HospitalizationWithPet,
} from './hospitalization.repository.interface';

@Injectable()
export class HospitalizationRepository extends IHospitalizationRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(petId: number, vetId: number): Promise<Hospitalization> {
    await this.db.insert(hospitalizations).values({
      pet_id: petId,
      vet_id: vetId,
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
          eq(hospitalizations.vet_id, vetId),
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

  async findByIdWithPet(id: number): Promise<HospitalizationWithPet | null> {
    const result = await this.db
      .select({
        id: hospitalizations.id,
        pet_id: hospitalizations.pet_id,
        vet_id: hospitalizations.vet_id,
        admission_date: hospitalizations.admission_date,
        egress_date: hospitalizations.egress_date,
        egress_status: hospitalizations.egress_status,
        created_at: hospitalizations.created_at,
        updated_at: hospitalizations.updated_at,
        deleted_at: hospitalizations.deleted_at,
        pet: {
          client_id: pets.client_id,
        },
      })
      .from(hospitalizations)
      .innerJoin(pets, eq(hospitalizations.pet_id, pets.id))
      .where(
        and(eq(hospitalizations.id, id), isNull(hospitalizations.deleted_at)),
      )
      .limit(1);

    return (result[0] as HospitalizationWithPet | undefined) ?? null;
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

  async findByClientId(clientId: number): Promise<Hospitalization[]> {
    const petRows = await this.db
      .select({ id: pets.id })
      .from(pets)
      .where(and(eq(pets.client_id, clientId), isNull(pets.deleted_at)));

    const petIds = petRows.map((p) => p.id);

    if (petIds.length === 0) {
      return [];
    }

    return this.db
      .select()
      .from(hospitalizations)
      .where(
        and(
          inArray(hospitalizations.pet_id, petIds),
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
