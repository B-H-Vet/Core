import type { RolNombre } from '../../database/schema/auth/roles.schema';

export interface CurrentUserPayload {
  id: number;
  email: string;
  rol: RolNombre;
  profileId: number | null;
}
