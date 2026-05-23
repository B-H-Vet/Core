export class UpdateServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  created_at!: Date;
}
