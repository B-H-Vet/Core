export class UserListResponseDto {
  data!: {
    id: string;
    name: string;
    email: string;
    email_verified_at: Date | null;
    created_at: Date;
    rol: string | null;
  }[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
