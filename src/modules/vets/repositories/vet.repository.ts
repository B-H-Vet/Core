import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import { users } from '../../../database/schema/auth/users.schema';
import { specialties } from '../../../database/schema/specialties/specialties.schema';
import { vetSpecialties } from '../../../database/schema/vets/vet-specialties.schema';
import { Vet, NewVet, vets } from '../../../database/schema/vets/vets.schema';

import { IVetRepository } from './vet.repository.interface';

interface VetWithRelations {
  id: number;
  license_number: string;
  is_active: boolean;
  created_at: Date;
  user: {
    id: number;
    email: string;
  };
  specialty: {
    id: number | null;
    name: string | null;
  };
}

interface CreateVetInput {
  user: { id: number };
  license_number: string;
  specialty?: { id: number } | null;
}

interface UpdateVetInput {
  id: number;
  license_number?: string;
  is_active?: boolean;
  specialty?: { id: number | null; name?: string | null } | null;
}

@Injectable()
export class VetRepository extends IVetRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database,
  ) {
    super();
  }

  async findAll(): Promise<VetWithRelations[]> {
    return this.db
      .select({
        id: vets.id,
        license_number: vets.license_number,
        is_active: vets.is_active,
        created_at: vets.created_at,
        user: {
          id: users.id,
          email: users.email,
        },
        specialty: {
          id: vetSpecialties.specialty_id,
          name: specialties.name,
        },
      })
      .from(vets)
      .innerJoin(users, eq(vets.user_id, users.id))
      .leftJoin(vetSpecialties, eq(vets.id, vetSpecialties.vet_id))
      .leftJoin(specialties, eq(vetSpecialties.specialty_id, specialties.id))
      .where(isNull(vets.deleted_at));
  }

  async findById(id: number): Promise<VetWithRelations | null> {
    const result = await this.db
      .select({
        id: vets.id,
        license_number: vets.license_number,
        is_active: vets.is_active,
        created_at: vets.created_at,
        user: {
          id: users.id,
          email: users.email,
        },
        specialty: {
          id: vetSpecialties.specialty_id,
          name: specialties.name,
        },
      })
      .from(vets)
      .innerJoin(users, eq(vets.user_id, users.id))
      .leftJoin(vetSpecialties, eq(vets.id, vetSpecialties.vet_id))
      .leftJoin(specialties, eq(vetSpecialties.specialty_id, specialties.id))
      .where(eq(vets.id, id))
      .limit(1);

    return (result[0] as VetWithRelations | undefined) ?? null;
  }

  async findByUserId(userId: number): Promise<Vet | null> {
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

    const newVet = await this.findByUserId(vet.user.id);

    if (vet.specialty?.id && newVet) {
      await this.db.insert(vetSpecialties).values({
        vet_id: newVet.id,
        specialty_id: vet.specialty.id,
      });
    }

    const created = await this.findById(newVet?.id ?? 0);
    if (!created) {
      throw new Error('Error al crear el veterinario');
    }

    return created;
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

    if (vet.specialty?.id) {
      await this.db
        .delete(vetSpecialties)
        .where(eq(vetSpecialties.vet_id, vet.id));

      await this.db.insert(vetSpecialties).values({
        vet_id: vet.id,
        specialty_id: vet.specialty.id,
      });
    }

    const updated = await this.findById(vet.id);
    if (!updated) {
      throw new Error('Error al actualizar el veterinario');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(vets)
      .set({ deleted_at: new Date() })
      .where(eq(vets.id, id));
  }
}
