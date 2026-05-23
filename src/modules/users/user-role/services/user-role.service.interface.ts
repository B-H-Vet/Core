import type { ApproveRoleResponseDto } from '../dto/approve-role-response.dto';
import type { AssignRoleResponseDto } from '../dto/assign-role-response.dto';
import type { AssignRoleDto } from '../dto/assign-role.dto';
import type { RevokeRoleResponseDto } from '../dto/revoke-role-response.dto';
import type { UserRoleListResponseDto } from '../dto/user-role-list-response.dto';

export const USER_ROLE_SERVICE = 'USER_ROLE_SERVICE';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export abstract class IUserRoleService {
  abstract findByUserId(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<UserRoleListResponseDto>;
  abstract assignRole(
    assignRoleDto: AssignRoleDto,
  ): Promise<AssignRoleResponseDto>;
  abstract revokeRole(
    userId: number,
    roleId: number,
    revokedBy: number,
  ): Promise<RevokeRoleResponseDto>;
  abstract approveRole(
    userId: number,
    roleId: number,
    approvedBy: number,
  ): Promise<ApproveRoleResponseDto>;
}
