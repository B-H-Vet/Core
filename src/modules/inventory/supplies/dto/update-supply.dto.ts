import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateSupplyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  measurementUnitId?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

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
