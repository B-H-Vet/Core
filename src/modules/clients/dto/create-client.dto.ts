import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsUUID()
  userId!: string;

  @IsString({ message: 'El teléfono ingresado debe ser texto' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 caracteres' })
  phone!: string;

  @IsString({ message: 'La dirección ingresada debe ser texto' })
  @IsOptional()
  address?: string;
}
