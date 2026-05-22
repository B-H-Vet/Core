import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreatePetDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  name!: string;

  @IsString({ message: 'La especie ingresada debe ser texto' })
  species!: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsDateString()
  @IsOptional()
  birth_date?: Date;

  @IsNumber()
  @IsOptional()
  weight?: number;
}