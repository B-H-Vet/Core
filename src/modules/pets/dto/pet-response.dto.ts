import { EstadoMascota } from '../../../database/schema/pets/pets.schema';

export class PetResponseDto {
  id!: number;
  name!: string;
  species!: string;
  breed!: string;
  color!: string;
  birth_date!: Date;
  weight!: number;
  status!: EstadoMascota;
  created_at!: Date;
  client!: {
    id: number;
  };
}