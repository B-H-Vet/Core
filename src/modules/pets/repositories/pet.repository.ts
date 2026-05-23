import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import { clients } from '../../../database/schema/clients/clients.schema';
import { pets } from '../../../database/schema/pets/pets.schema';

import type {
  CreatePetInput,
  PaginationParams,
  PetRow,
} from './pet.repository.interface';
import { IPetRepository } from './pet.repository.interface';

const PET_SELECT = {
  id: pets.id,
  name: pets.name,
  species: pets.species,
  breed: pets.breed,
  color: pets.color,
  birth_date: pets.birth_date,
  weight: pets.weight,
  status: pets.status,
  created_at: pets.created_at,
  updated_at: pets.updated_at,
  client: {
    id: clients.id,
  },
} as const;

type DrizzleDB = MySql2Database;

@Injectable()
export class PetRepository extends IPetRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {
    super();
  }

  async findAll(pagination: PaginationParams): Promise<PetRow[]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const result = await this.db
      .select(PET_SELECT)
      .from(pets)
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .where(isNull(pets.deleted_at))
      .limit(limit)
      .offset((page - 1) * limit);

    return result as PetRow[];
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(pets)
      .where(isNull(pets.deleted_at));

    return result[0]?.count ?? 0;
  }

  async findById(id: number): Promise<PetRow | null> {
    const result = await this.db
      .select(PET_SELECT)
      .from(pets)
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .where(eq(pets.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as PetRow) : null;
  }

  async findByClientId(
    clientId: number,
    pagination: PaginationParams,
  ): Promise<PetRow[]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const result = await this.db
      .select(PET_SELECT)
      .from(pets)
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .where(and(eq(pets.client_id, clientId), isNull(pets.deleted_at)))
      .limit(limit)
      .offset((page - 1) * limit);

    return result as PetRow[];
  }

  async countByClientId(clientId: number): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(pets)
      .where(and(eq(pets.client_id, clientId), isNull(pets.deleted_at)));

    return result[0]?.count ?? 0;
  }

  async create(pet: CreatePetInput): Promise<PetRow> {
    const [insertResult] = await this.db.insert(pets).values({
      client_id: pet.client.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? null,
      color: pet.color ?? null,
      birth_date: pet.birth_date ? new Date(pet.birth_date) : null,
      weight: pet.weight?.toString() ?? null,
    });

    const insertedId = insertResult.insertId;

    const result = await this.db
      .select(PET_SELECT)
      .from(pets)
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .where(eq(pets.id, insertedId))
      .limit(1);

    return result[0] as PetRow;
  }

  async update(pet: PetRow): Promise<PetRow> {
    await this.db
      .update(pets)
      .set({
        name: pet.name,
        species: pet.species,
        breed: pet.breed ?? null,
        color: pet.color ?? null,
        birth_date: pet.birth_date ? new Date(pet.birth_date) : null,
        weight: pet.weight ?? null,
        status: pet.status,
        updated_at: new Date(),
      })
      .where(eq(pets.id, pet.id));

    const updated = await this.findById(pet.id);

    if (!updated) {
      throw new Error(
        'Pet with id ' + pet.id.toString() + ' not found after update',
      );
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(pets)
      .set({ deleted_at: new Date() })
      .where(eq(pets.id, id));
  }
}
