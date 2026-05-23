import { IsArray, IsNumber } from 'class-validator';

export class AssignVetSpecialtiesDto {
  @IsNumber()
  vetId!: number;

  @IsArray()
  @IsNumber({}, { each: true })
  specialtyIds!: number[];
}
