export class VetUserResponseDto {
  id!: string;
  email!: string;
}

export class VetSpecialtyResponseDto {
  id!: number;
  name!: string;
}

export class FindAllVetsResponseDto {
  data!: {
    id: number;
    license_number: string;
    is_active: boolean;
    created_at: Date;
    user: VetUserResponseDto;
    specialties: VetSpecialtyResponseDto[];
  }[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
