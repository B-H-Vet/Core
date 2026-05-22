import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateVetDto {
  @IsString()
  @IsOptional()
  license_number?: string;

  @IsNumber()
  @IsOptional()
  specialtyId?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}