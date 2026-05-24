import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum PaymentMethodDto {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  PSE = 'PSE',
}

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentMethodDto)
  method: PaymentMethodDto;

  @IsOptional()
  @IsString()
  transaction_reference?: string;
}