import type { EstadoMascota } from '../../../database/schema/pets/pets.schema';

export const PET_REPOSITORY = 'PET_REPOSITORY';

export interface PetRow {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  color: string | null;
  birth_date: string | null;
  weight: string | null;
  status: EstadoMascota;
  created_at: Date;
  client: {
    id: number;
  };
}

export interface CreatePetInput {
  client: { id: number };
  name: string;
  species: string;
  breed?: string | null;
  color?: string | null;
  birth_date?: string | null;
  weight?: number | null;
}

export abstract class IPetRepository {
  abstract findAll(): Promise<PetRow[]>;
  abstract findById(id: number): Promise<PetRow | null>;
  abstract findByClientId(clientId: number): Promise<PetRow[]>;
  abstract create(pet: CreatePetInput): Promise<PetRow>;
  abstract update(pet: PetRow): Promise<PetRow>;
  abstract delete(id: number): Promise<void>;
}
