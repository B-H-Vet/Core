import type { RolNombre } from '../../database/schema/auth/roles.schema';

export interface CurrentUserPayload {
  id: string;
  email: string;
  rol: RolNombre;
  profileId: number | null;
}
