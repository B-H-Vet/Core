import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicineDetailDto {
  @IsInt()
  @IsNotEmpty()
  supply_id!: number;

  @IsString()
  @IsNotEmpty()
  dose!: string;

  @IsString()
  @IsNotEmpty()
  duration!: string;
}

export class CreateVaccineDetailDto {
  @IsInt()
  @IsNotEmpty()
  supply_id!: number;

  @IsDateString()
  applied_date!: string;

  @IsOptional()
  @IsDateString()
  next_dose_date?: string;
}

export class CreateMedicalRecordDto {
  @IsInt()
  @IsNotEmpty()
  appointment_id!: number;

  @IsString()
  @IsNotEmpty()
  visit_reason!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  treatment!: string;

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