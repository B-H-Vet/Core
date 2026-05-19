import { IsString, MinLength } from 'class-validator';

export class CreateMeasurementUnitDto {
  @IsString({ message: 'La unidad ingresada debe ser texto' })
  @MinLength(1, { message: 'La unidad no puede estar vacía' })
  unit!: string;
}