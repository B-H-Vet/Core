export class ClientResponseDto {
  id!: number;
  phone!: string;
  address!: string | null;
  is_active!: boolean;
  created_at!: Date;
  user!: {
    id: number;
    email: string;
  };
}
