import type { Role } from '../../../../database/schema/auth/roles.schema';

export class UserResponseDto {
  id!: number;
  email!: string;
  email_verified_at!: Date | null;
  approved_at!: Date | null;
  created_at!: Date;
  rol!: Role['name'] | null;
}
