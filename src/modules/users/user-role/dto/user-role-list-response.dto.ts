export class UserRoleListResponseDto {
  data!: {
    id: number;
    user_id: string;
    role_id: number;
    role_name: string;
    assigned_at: Date;
    approved_at: Date | null;
    approved_by: string | null;
    revoked_at: Date | null;
    revoked_by: string | null;
  }[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
