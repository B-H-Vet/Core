export class UpdateVetResponseDto {
  id!: number;
  license_number!: string;
  is_active!: boolean;
  created_at!: Date;
  user!: {
    id: number;
    email: string;
  };
  specialties!: {
    id: number;
    name: string;
  }[];
}
