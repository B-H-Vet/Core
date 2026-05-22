export class VetResponseDto {
  id!: number;
  license_number!: string;
  specialty!: { id: number | null; name: string | null } | null;
  is_active!: boolean;
  created_at!: Date;
  user!: {
    id: number;
    email: string;
  };
}
