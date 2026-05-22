import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción ingresada debe ser texto' })
  description?: string;

  @IsNumber({}, { message: 'El precio ingresado debe ser un número' })
  @Min(0, { message: 'El precio ingresado no puede ser negativo' })
  price!: number;
}
