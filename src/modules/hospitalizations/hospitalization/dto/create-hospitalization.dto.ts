import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateHospitalizationDto {
  @IsInt()
  @IsNotEmpty()
  pet_id!: number;
}
