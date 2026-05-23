export class UserRoleResponseDto {
  id!: number;
  user_id!: number;
  role_id!: number;
  role_name!: string;
  assigned_at!: Date;
  approved_at!: Date | null;
  approved_by!: number | null;
  revoked_at!: Date | null;
  revoked_by!: number | null;
}
