import type { RolNombre } from '../../../../database/schema/auth/roles.schema';
import type { CreateRoleResponseDto } from '../dto/create-role-response.dto';
import type { CreateRoleDto } from '../dto/create-role.dto';
import type { DeleteRoleResponseDto } from '../dto/delete-role-response.dto';
import type { RoleDetailResponseDto } from '../dto/role-detail-response.dto';
import type { RoleListResponseDto } from '../dto/role-list-response.dto';
import type { RoleResponseDto } from '../dto/role-response.dto';
import type { UpdateRoleResponseDto } from '../dto/update-role-response.dto';
import type { UpdateRoleDto } from '../dto/update-role.dto';

export const ROLE_SERVICE = 'ROLE_SERVICE';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export abstract class IRoleService {
  abstract findAll(pagination?: PaginationParams): Promise<RoleListResponseDto>;
  abstract findById(id: number): Promise<RoleDetailResponseDto>;
  abstract findByName(name: RolNombre): Promise<RoleResponseDto>;
  abstract create(createRoleDto: CreateRoleDto): Promise<CreateRoleResponseDto>;
  abstract update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateRoleResponseDto>;
  abstract delete(id: number): Promise<DeleteRoleResponseDto>;
}
