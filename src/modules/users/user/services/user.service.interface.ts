import type { User } from '../../../../database/schema/auth/users.schema';
import type { ApproveUserResponseDto } from '../dto/approve-user-response.dto';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { DeactivateUserResponseDto } from '../dto/deactivate-user-response.dto';
import type { PendingUsersResponseDto } from '../dto/pending-users-response.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { UserDetailResponseDto } from '../dto/user-detail-response.dto';
import type { UserListResponseDto } from '../dto/user-list-response.dto';
import type { UserResponseDto } from '../dto/user-response.dto';

export const USER_SERVICE = 'USER_SERVICE';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export abstract class IUserService {
  abstract findAll(pagination?: PaginationParams): Promise<UserListResponseDto>;
  abstract findById(id: string): Promise<UserDetailResponseDto>;
  abstract findByIdEntity(id: string): Promise<User>;
  abstract findPendientesAprobacion(
    pagination?: PaginationParams,
  ): Promise<PendingUsersResponseDto>;
  abstract aprobarCuenta(
    id: string,
    adminId: string,
  ): Promise<ApproveUserResponseDto>;
  abstract desactivarCuenta(
    id: string,
    adminId: string,
  ): Promise<DeactivateUserResponseDto>;
  abstract create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
  abstract update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto>;
  abstract delete(id: string): Promise<void>;
}
