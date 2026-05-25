import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class AddAdditionalServiceDto {
  @IsInt()
  @IsNotEmpty()
  service_id!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discount_percent?: number;
}
