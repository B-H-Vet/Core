import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class ApplyDiscountDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  discount_percent!: number;
}
