import type { Vet } from '../../../../database/schema/vets/vets.schema';

export interface PaginationParams {
  page?: number | undefined;
  limit?: number | undefined;
}

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
  specialties: {
    id: number;
    name: string;
  }[];
}

export interface CreateVetInput {
  user: {
    id: number;
  };
  license_number: string;
}

export interface UpdateVetInput {
  id: number;
  license_number?: string;
  is_active?: boolean;
}

export abstract class IVetRepository {
  abstract findAll(pagination?: PaginationParams): Promise<VetWithRelations[]>;

  abstract count(): Promise<number>;

  abstract findById(id: number): Promise<VetWithRelations | null>;

  abstract findByUserId(userId: number): Promise<Vet | null>;

  abstract create(vet: CreateVetInput): Promise<VetWithRelations>;

  abstract update(vet: UpdateVetInput): Promise<VetWithRelations>;

  abstract delete(id: number): Promise<void>;
}
