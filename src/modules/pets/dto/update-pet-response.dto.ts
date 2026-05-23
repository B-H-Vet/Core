import type { EstadoMascota } from '../../../database/schema/pets/pets.schema';

export class UpdatePetResponseDto {
  id!: number;
  name!: string;
  species!: string;
  breed!: string | null;
  color!: string | null;
  birth_date!: string | null;
  weight!: number | null;
  status!: EstadoMascota;
  updated_at!: Date;
}