import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { pets } from '../../../database/schema/pets/pets.schema';
import { clients } from '../../../database/schema/clients/clients.schema';
import { IPetRepository } from './pet.repository.interface';

@Injectable()
export class PetRepository extends IPetRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {
    super();
  }

  async findAll(): Promise<any[]> {
    return this.db
      .select({
        id: pets.id,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        color: pets.color,
        birth_date: pets.birth_date,
        weight: pets.weight,
        status: pets.status,
        created_at: pets.created_at,
        client: {
          id: clients.id,
        },
      })
      .from(pets)
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .where(isNull(pets.deleted_at));
  }

  async findById(id: number): Promise<any | null> {
    const result = await this.db
      .select({
        id: pets.id,
        name: pets.name,
        species: pets.species,
        breed: pets.breed,
        color: pets.color,
        birth_date: pets.birth_date,
        weight: pets.weight,
        status: pets.status,
        created_at: pets.created_at,
        client: {
          id: clients.id,
        },
      })
      .from(pets)
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .where(eq(pets.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByClientId(clientId: number): Promise<any[]> {
    return this.db
      .select()
      .from(pets)
      .where(eq(pets.client_id, clientId));
  }

  async create(pet: any): Promise<any> {
    await this.db.insert(pets).values({
      client_id: pet.client.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      birth_date: pet.birth_date,
      weight: pet.weight,
    });
    const result = await this.db
      .select()
      .from(pets)
      .where(eq(pets.client_id, pet.client.id))
      .orderBy(pets.id)
      .limit(1);
    return result[0];
  }

  async update(pet: any): Promise<any> {
    await this.db
      .update(pets)
      .set({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        color: pet.color,
        birth_date: pet.birth_date,
        weight: pet.weight,
        status: pet.status,
        updated_at: new Date(),
      })
      .where(eq(pets.id, pet.id));
    return this.findById(pet.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(pets)
      .set({ deleted_at: new Date() })
      .where(eq(pets.id, id));
  }
}