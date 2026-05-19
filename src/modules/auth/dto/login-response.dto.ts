import type { RolNombre } from '../../../database/schema/auth/roles.schema';

export class LoginResponseDto {
  token!: string;
  rol!: RolNombre;
}
