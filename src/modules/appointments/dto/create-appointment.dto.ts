import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @IsInt()
  @IsNotEmpty()
  vet_id!: number;

  @IsInt()
  @IsNotEmpty()
  pet_id!: number;

  @IsDateString()
  date!: string;

  @IsArray()
  @ArrayMinSize(1)
  service_ids!: number[];
}
