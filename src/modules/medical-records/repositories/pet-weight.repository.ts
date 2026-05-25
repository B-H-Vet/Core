import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { pets } from '../../../database/schema/pets/pets.schema';

import { IPetWeightRepository } from './pet-weight.repository.interface';

@Injectable()
export class PetWeightRepository extends IPetWeightRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async updateWeight(petId: number, weight: string): Promise<void> {
    await this.db
      .update(pets)
      .set({
        weight,
        updated_at: new Date(),
      })
      .where(eq(pets.id, petId));
  }
}
