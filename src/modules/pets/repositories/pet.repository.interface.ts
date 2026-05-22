export const PET_REPOSITORY = 'PET_REPOSITORY';

export abstract class IPetRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract findByClientId(clientId: number): Promise<any[]>;
  abstract create(pet: any): Promise<any>;
  abstract update(pet: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}