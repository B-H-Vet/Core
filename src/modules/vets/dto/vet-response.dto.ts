export class VetResponseDto {
  id!: number;
  license_number!: string;
  specialty!: { id: number; name: string } | null;
  is_active!: boolean;
  created_at!: Date;
  user!: {
    id: number;
    email: string;
  };
}