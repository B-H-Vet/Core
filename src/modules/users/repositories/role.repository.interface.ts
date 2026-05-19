export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';

export abstract class IRoleRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract findByName(name: string): Promise<any | null>;
  abstract create(role: any): Promise<any>;
  abstract update(role: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}
