import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
export class VaccinationAlertQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;
}
