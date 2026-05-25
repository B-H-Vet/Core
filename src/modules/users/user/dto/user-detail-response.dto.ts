export class UserDetailResponseDto {
  id!: string;
  name!: string;
  email!: string;
  email_verified_at!: Date | null;
  created_at!: Date;
  updated_at!: Date | null;
  rol!: string | null;
  roles!: {
    id: number;
    name: string;
    assigned_at: Date;
    approved_at: Date | null;
    revoked_at: Date | null;
  }[];
}
