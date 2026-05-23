import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateSpecialtyDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
