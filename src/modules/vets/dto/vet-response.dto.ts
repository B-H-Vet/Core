export class VetUserResponseDto {
  id!: number;
  email!: string;
}

export class VetSpecialtyResponseDto {
  id!: number | null;
  name!: string | null;
}

export class VetResponseDto {
  id!: number;
  license_number!: string;
  specialty!: VetSpecialtyResponseDto | null;
  is_active!: boolean;
  created_at!: Date;
  user!: VetUserResponseDto;
}
