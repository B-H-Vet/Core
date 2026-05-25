import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  visit_reason?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight_at_visit?: number;

  @IsOptional()
  @IsDateString()
  next_visit_date?: string;
}
