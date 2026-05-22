import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsNumber()
  userId!: number;

  @IsString({ message: 'El teléfono ingresado debe ser texto' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres' })
  phone!: string;

  @IsString({ message: 'La dirección ingresada debe ser texto' })
  @IsOptional()
  address?: string;
}
