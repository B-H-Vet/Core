import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray, isNull, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../../database/database.module';
import { users } from '../../../../database/schema/auth/users.schema';
import { specialties } from '../../../../database/schema/specialties/specialties.schema';
import { vetSpecialties } from '../../../../database/schema/vets/vet-specialties.schema';
import {
  Vet,
  NewVet,
  vets,
} from '../../../../database/schema/vets/vets.schema';

import {
  IVetRepository,
  CreateVetInput,
  UpdateVetInput,
  VetWithRelations,
  PaginationParams,
} from './vet.repository.interface';

@Injectable()
export class VetRepository extends IVetRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database,
  ) {
    super();
  }

  async findAll(pagination?: PaginationParams): Promise<VetWithRelations[]> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const offset = (page - 1) * limit;

    const vetRows = await this.db
      .select({
        id: vets.id,
        license_number: vets.license_number,
        is_active: vets.is_active,
        created_at: vets.created_at,
        user_id: users.id,
        user_email: users.email,
      })
      .from(vets)
      .innerJoin(users, eq(vets.user_id, users.id))
      .where(isNull(vets.deleted_at))
      .limit(limit)
      .offset(offset);

    if (vetRows.length === 0) {
      return [];
    }

    const vetIds = vetRows.map((v) => v.id);

    const specialtyRows = await this.db
      .select({
        vet_id: vetSpecialties.vet_id,
        specialty_id: specialties.id,
        specialty_name: specialties.name,
      })
      .from(vetSpecialties)
      .innerJoin(specialties, eq(vetSpecialties.specialty_id, specialties.id))
      .where(inArray(vetSpecialties.vet_id, vetIds));

    const specialtiesByVet = new Map<number, { id: number; name: string }[]>();
    for (const row of specialtyRows) {
      const list = specialtiesByVet.get(row.vet_id) ?? [];
      list.push({ id: row.specialty_id, name: row.specialty_name });
      specialtiesByVet.set(row.vet_id, list);
    }

    return vetRows.map((vet) => ({
      id: vet.id,
      license_number: vet.license_number,
      is_active: vet.is_active,
      created_at: vet.created_at,
      user: {
        id: vet.user_id,
        email: vet.user_email,
      },
      specialties: specialtiesByVet.get(vet.id) ?? [],
    }));
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(vets)
      .where(isNull(vets.deleted_at));

    return result[0]?.count ?? 0;
  }

  async findById(id: number): Promise<VetWithRelations | null> {
    const vetRows = await this.db
      .select({
        id: vets.id,
        license_number: vets.license_number,
        is_active: vets.is_active,
        created_at: vets.created_at,
        user_id: users.id,
        user_email: users.email,
      })
      .from(vets)
      .innerJoin(users, eq(vets.user_id, users.id))
      .where(eq(vets.id, id))
      .limit(1);

    if (!vetRows[0]) {
      return null;
    }

    const vet = vetRows[0];

    const specialtyRows = await this.db
      .select({
        specialty_id: specialties.id,
        specialty_name: specialties.name,
      })
      .from(vetSpecialties)
      .innerJoin(specialties, eq(vetSpecialties.specialty_id, specialties.id))
      .where(eq(vetSpecialties.vet_id, vet.id));

    return {
      id: vet.id,
      license_number: vet.license_number,
      is_active: vet.is_active,
      created_at: vet.created_at,
      user: {
        id: vet.user_id,
        email: vet.user_email,
      },
      specialties: specialtyRows.map((s) => ({
        id: s.specialty_id,
        name: s.specialty_name,
      })),
    };
  }

  async findByUserId(userId: string): Promise<Vet | null> {
    const result = await this.db
      .select()
      .from(vets)
      .where(eq(vets.user_id, userId))
      .limit(1);

    return (result[0] as Vet | undefined) ?? null;
  }

  async create(vet: CreateVetInput): Promise<VetWithRelations> {
    await this.db.insert(vets).values({
      user_id: vet.user.id,
      license_number: vet.license_number,
    } as NewVet);

    const created = await this.findByUserId(vet.user.id);

    if (!created) {
      throw new Error('Error al crear el veterinario');
    }

    const withRelations = await this.findById(created.id);

    if (!withRelations) {
      throw new Error('Error al crear el veterinario');
    }

    return withRelations;
  }

  async update(vet: UpdateVetInput): Promise<VetWithRelations> {
    await this.db
      .update(vets)
      .set({
        license_number: vet.license_number,
        is_active: vet.is_active,
        updated_at: new Date(),
      })
      .where(eq(vets.id, vet.id));

    const updated = await this.findById(vet.id);

    if (!updated) {
      throw new Error('Error al actualizar el veterinario');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(vets)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(vets.id, id));
  }
}
