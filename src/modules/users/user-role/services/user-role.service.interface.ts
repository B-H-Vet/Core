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
    userId: string,
    pagination?: PaginationParams,
  ): Promise<UserRoleListResponseDto>;
  abstract assignRole(
    assignRoleDto: AssignRoleDto,
  ): Promise<AssignRoleResponseDto>;
  abstract revokeRole(
    userRoleId: number,
    revokedBy: string,
  ): Promise<RevokeRoleResponseDto>;
  abstract approveRole(
    userRoleId: number,
    approvedBy: string,
  ): Promise<ApproveRoleResponseDto>;
}
