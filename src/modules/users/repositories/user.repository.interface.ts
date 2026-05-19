export const USER_REPOSITORY = 'USER_REPOSITORY';

export abstract class IUserRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract findByEmail(email: string): Promise<any | null>;
  abstract create(user: any): Promise<any>;
  abstract update(user: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}
