import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { vets } from '../../../database/schema/vets/vets.schema';
import { users } from '../../../database/schema/auth/users.schema';
import { specialties } from '../../../database/schema/vets/specialties.schema';
import { IVetRepository } from './vet.repository.interface';

@Injectable()
export class VetRepository extends IVetRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {
    super();
  }

  async findAll(): Promise<any[]> {
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
          id: specialties.id,
          name: specialties.name,
        },
      })
      .from(vets)
      .innerJoin(users, eq(vets.user_id, users.id))
      .leftJoin(specialties, eq(vets.specialty_id, specialties.id))
      .where(isNull(vets.deleted_at));
  }

  async findById(id: number): Promise<any | null> {
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
          id: specialties.id,
          name: specialties.name,
        },
      })
      .from(vets)
      .innerJoin(users, eq(vets.user_id, users.id))
      .leftJoin(specialties, eq(vets.specialty_id, specialties.id))
      .where(eq(vets.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: number): Promise<any | null> {
    const result = await this.db
      .select()
      .from(vets)
      .where(eq(vets.user_id, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(vet: any): Promise<any> {
    await this.db.insert(vets).values({
      user_id: vet.user.id,
      license_number: vet.license_number,
      specialty_id: vet.specialty?.id ?? null,
    });
    return this.findByUserId(vet.user.id);
  }

  async update(vet: any): Promise<any> {
    await this.db
      .update(vets)
      .set({
        license_number: vet.license_number,
        is_active: vet.is_active,
        specialty_id: vet.specialty?.id ?? null,
        updated_at: new Date(),
      })
      .where(eq(vets.id, vet.id));
    return this.findById(vet.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(vets)
      .set({ deleted_at: new Date() })
      .where(eq(vets.id, id));
  }
}