import type { Vet } from '../../../database/schema/vets/vets.schema';

export const VET_REPOSITORY = 'VET_REPOSITORY';

export interface VetWithRelations {
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
  } | null;
}

export interface CreateVetInput {
  user: {
    id: number;
  };
  license_number: string;
  specialty?: {
    id: number;
  } | null;
}

export interface UpdateVetInput {
  id: number;
  license_number?: string;
  is_active?: boolean;
  specialty?: {
    id: number | null;
    name?: string | null;
  } | null;
}

export abstract class IVetRepository {
  abstract findAll(): Promise<VetWithRelations[]>;

  abstract findById(id: number): Promise<VetWithRelations | null>;

  abstract findByUserId(userId: number): Promise<Vet | null>;

  abstract create(vet: CreateVetInput): Promise<VetWithRelations>;

  abstract update(vet: UpdateVetInput): Promise<VetWithRelations>;

  abstract delete(id: number): Promise<void>;
}
