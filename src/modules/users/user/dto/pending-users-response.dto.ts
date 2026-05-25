export class PendingUsersResponseDto {
  data!: {
    id: number;
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
