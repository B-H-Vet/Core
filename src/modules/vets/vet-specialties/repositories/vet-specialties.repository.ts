import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../../database/database.module';
import { vetSpecialties } from '../../../../database/schema/vets/vet-specialties.schema';

import {
  IVetSpecialtiesRepository,
  VetSpecialty,
} from './vet-specialties.repository.interface';

@Injectable()
export class VetSpecialtiesRepository extends IVetSpecialtiesRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database,
  ) {
    super();
  }

  async findByVetId(vetId: number): Promise<VetSpecialty[]> {
    return this.db
      .select()
      .from(vetSpecialties)
      .where(eq(vetSpecialties.vet_id, vetId));
  }

  async createMany(entries: VetSpecialty[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }
    await this.db.insert(vetSpecialties).values(entries);
  }

  async deleteByVetId(vetId: number): Promise<void> {
    await this.db
      .delete(vetSpecialties)
      .where(eq(vetSpecialties.vet_id, vetId));
  }

  async deleteByVetIdAndSpecialtyIds(
    vetId: number,
    specialtyIds: number[],
  ): Promise<void> {
    if (specialtyIds.length === 0) {
      return;
    }
    await this.db
      .delete(vetSpecialties)
      .where(
        and(
          eq(vetSpecialties.vet_id, vetId),
          inArray(vetSpecialties.specialty_id, specialtyIds),
        ),
      );
  }
}
