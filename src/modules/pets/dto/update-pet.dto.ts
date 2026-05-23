import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';

import { EstadoMascota } from '../../../database/schema/pets/pets.schema';

export class UpdatePetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsEnum(EstadoMascota)
  @IsOptional()
  status?: EstadoMascota;
}
