import type { RolNombre } from '../../../database/schema/auth/roles.schema';

export class UserResponseDto {
  id!: number;
  email!: string;
  email_verified_at!: Date;
  approved_at!: Date;
  created_at!: Date;
  rol!: RolNombre;
}
