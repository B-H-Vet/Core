import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreatePetDto {
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  clientId!: number;

  @IsString({ message: 'El nombre ingresado debe ser texto' })
  name!: string;

  @IsString({ message: 'La especie ingresada debe ser texto' })
  species!: string;

  @IsString({ message: 'La raza ingresada debe ser texto' })
  breed!: string;

  @IsString({ message: 'El color ingresado debe ser texto' })
  color!: string;

  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @IsNumber({}, { message: 'El peso ingresado debe ser un número' })
  weight!: number;
}
