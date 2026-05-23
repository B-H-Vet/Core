import type { PetResponseDto } from './pet-response.dto';

export class PetListResponseDto {
  data!: PetResponseDto[];
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
