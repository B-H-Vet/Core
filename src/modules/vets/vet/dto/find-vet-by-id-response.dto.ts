export class VetUserResponseDto {
  id!: number;
  email!: string;
}

export class VetSpecialtyResponseDto {
  id!: number;
  name!: string;
}

export class FindVetByIdResponseDto {
  id!: number;
  license_number!: string;
  is_active!: boolean;
  created_at!: Date;
  user!: VetUserResponseDto;
  specialties!: VetSpecialtyResponseDto[];
}
