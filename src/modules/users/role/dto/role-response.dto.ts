export class RoleResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  requires_approval!: boolean;
  is_active!: boolean;
}
