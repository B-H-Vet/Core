import type {
  User,
  NewUser,
} from '../../../../database/schema/auth/users.schema';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export abstract class IUserRepository {
  abstract findAll(): Promise<User[]>;
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: NewUser): Promise<User | null>;
  abstract update(user: User): Promise<User | null>;
  abstract delete(id: number): Promise<void>;
}
