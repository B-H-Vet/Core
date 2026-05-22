export const VET_REPOSITORY = 'VET_REPOSITORY';

export abstract class IVetRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract findByUserId(userId: number): Promise<any | null>;
  abstract create(vet: any): Promise<any>;
  abstract update(vet: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}