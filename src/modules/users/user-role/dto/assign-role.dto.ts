import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsNumber()
  @IsNotEmpty()
  roleId!: number;
}
