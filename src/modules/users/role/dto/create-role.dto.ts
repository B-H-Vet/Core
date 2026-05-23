import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
  ROL_NOMBRES,
  type RolNombre,
} from '../../../../database/schema/auth/roles.schema';

export class CreateRoleDto {
  @IsEnum(ROL_NOMBRES)
  @IsNotEmpty()
  name!: RolNombre;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  requiresApproval?: boolean;
}
