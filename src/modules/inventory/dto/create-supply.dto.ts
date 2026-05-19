import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateSupplyDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  name!: string;

  @IsNumber()
  measurementUnitId!: number;

  @IsNumber()
  categoryId!: number;

  @IsNumber({}, { message: 'El precio ingresado debe ser un número' })
  @Min(0)
  price!: number;

  @IsDateString()
  @IsOptional()
  expiring_date?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  min_stock?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;
}
