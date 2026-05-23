import type { EstadoMascota } from '../../../database/schema/pets/pets.schema';

export class CreatePetResponseDto {
  id!: number;
  name!: string;
  species!: string;
  breed!: string | null;
  color!: string | null;
  birth_date!: string | null;
  weight!: string | null;
  status!: EstadoMascota;
  client!: {
    id: number;
  };
}
