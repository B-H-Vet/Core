export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';

export interface ClientWithUser {
  id: number;
  phone: string;
  address: string | null;
  is_active: boolean;
  created_at: Date;

  user: {
    id: number;
    email: string;
  };
}

export abstract class IClientRepository {
  abstract findAll(): Promise<ClientWithUser[]>;
  abstract findById(id: number): Promise<ClientWithUser | null>;
  abstract findByUserId(userId: number): Promise<ClientWithUser | null>;

  abstract create(client: {
    user: { id: number };
    phone: string;
    address?: string;
  }): Promise<ClientWithUser>;

  abstract update(client: ClientWithUser): Promise<ClientWithUser>;

  abstract delete(id: number): Promise<void>;
}
