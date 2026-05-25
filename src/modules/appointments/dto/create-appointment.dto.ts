import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  vet_id!: number;

  @IsInt()
  @IsNotEmpty()
  pet_id!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsArray()
  @ArrayMinSize(1)
  service_ids!: number[];

  @IsInt()
  @IsOptional()
  client_id?: number;
}
