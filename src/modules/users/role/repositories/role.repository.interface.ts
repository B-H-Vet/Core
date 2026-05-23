import type {
  Role,
  NewRole,
  RolNombre,
} from '../../../../database/schema/auth/roles.schema';

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';

export abstract class IRoleRepository {
  abstract findAll(): Promise<Role[]>;
  abstract findById(id: number): Promise<Role | null>;
  abstract findByName(name: RolNombre): Promise<Role | null>;
  abstract create(role: NewRole): Promise<Role | null>;
  abstract update(role: Role): Promise<Role | null>;
  abstract delete(id: number): Promise<void>;
}
