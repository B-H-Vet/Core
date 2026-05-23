import { PetResponseDto } from './pet-response.dto';

export class PetListResponseDto {
  data!: PetResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}