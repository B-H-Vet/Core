import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
