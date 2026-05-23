export class RoleDetailResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  requires_approval!: boolean;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;
}
