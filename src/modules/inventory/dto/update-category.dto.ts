import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}