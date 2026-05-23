import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class UpdateVetDto {
  @IsString()
  @IsOptional()
  license_number?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specialtyIds?: number[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
