import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  @MinLength(2, {
    message: 'El nombre ingresado debe tener al menos 2 caracteres',
  })
  name!: string;
}
