import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export class CreateVetDto {
  @IsString({ message: 'El número de licencia ingresado debe ser texto' })
  @MinLength(3)
  license_number!: string;

  @IsNumber()
  @IsOptional()
  specialtyId?: number;
}