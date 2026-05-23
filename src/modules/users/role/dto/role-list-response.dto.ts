export class RoleListResponseDto {
  data!: {
    id: number;
    name: string;
    description: string | null;
    requires_approval: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
