import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  @MinLength(3, {
    message: 'El nombre ingresado debe tener al menos 3 caracteres',
  })
  name!: string;

  @IsString({ message: 'La descripción ingresada debe ser texto' })
  @IsOptional()
  description?: string;
}
