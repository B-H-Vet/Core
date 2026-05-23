import {
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateVetDto {
  @IsString({ message: 'El número de licencia ingresado debe ser texto' })
  @MinLength(3)
  license_number!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specialtyIds?: number[];
}
