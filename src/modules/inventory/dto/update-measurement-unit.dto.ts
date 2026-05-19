import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateMeasurementUnitDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  unit?: string;
}