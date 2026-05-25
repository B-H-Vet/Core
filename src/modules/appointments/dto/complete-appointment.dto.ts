import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  CreateMedicineDetailDto,
  CreateVaccineDetailDto,
} from '../../medical-records/dto/create-medical-record.dto';

export class CompleteAppointmentDto {
  @IsString()
  @IsOptional()
  visit_reason?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsNumber()
  @Min(0)
  weight_at_visit!: number;

  @IsOptional()
  @IsDateString()
  next_visit_date?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMedicineDetailDto)
  medicines?: CreateMedicineDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVaccineDetailDto)
  vaccines?: CreateVaccineDetailDto[];
}
