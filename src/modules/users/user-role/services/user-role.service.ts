import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import type { ApproveRoleResponseDto } from '../dto/approve-role-response.dto';
import type { AssignRoleResponseDto } from '../dto/assign-role-response.dto';
import type { AssignRoleDto } from '../dto/assign-role.dto';
import type { RevokeRoleResponseDto } from '../dto/revoke-role-response.dto';
import type { UserRoleListResponseDto } from '../dto/user-role-list-response.dto';
import {
  IUserRoleRepository,
  USER_ROLE_REPOSITORY,
} from '../repositories/user-role.repository.interface';

import type {
  IUserRoleService,
  PaginationParams,
} from './user-role.service.interface';

@Injectable()
export class UserRoleService implements IUserRoleService {
  constructor(
    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async findByUserId(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<UserRoleListResponseDto> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const userRoles = await this.userRoleRepository.findByUserId(userId);
    const allData = userRoles.map((ur) => ({
      id: ur.id,
      user_id: ur.user_id,
      role_id: ur.role_id,
      role_name: ur.role.name,
      assigned_at: ur.assigned_at,
      approved_at: ur.approved_at,
      approved_by: ur.approved_by,
      revoked_at: ur.revoked_at,
      revoked_by: ur.revoked_by,
    }));

    const total = allData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = allData.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async assignRole(
    assignRoleDto: AssignRoleDto,
  ): Promise<AssignRoleResponseDto> {
    const existingRole = await this.userRoleRepository.findByUserIdAndRoleId(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );

    if (existingRole && !existingRole.revoked_at) {
      throw new BadRequestException('El usuario ya tiene este rol asignado');
    }

    const userRole = await this.userRoleRepository.create({
      user: { id: assignRoleDto.userId },
      role: { id: assignRoleDto.roleId },
    });

    if (!userRole) {
      throw new BadRequestException('No se pudo asignar el rol');
    }

    const fullUserRole = await this.userRoleRepository.findByUserIdAndRoleId(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );

    if (!fullUserRole) {
      throw new NotFoundException('No se pudo obtener el rol asignado');
    }

    return {
      message: 'Rol asignado exitosamente',
      data: {
        id: fullUserRole.id,
        user_id: fullUserRole.user_id,
        role_id: fullUserRole.role_id,
        role_name: fullUserRole.role.name,
        assigned_at: fullUserRole.assigned_at,
        approved_at: fullUserRole.approved_at,
        approved_by: fullUserRole.approved_by,
        revoked_at: fullUserRole.revoked_at,
        revoked_by: fullUserRole.revoked_by,
      },
    };
  }

  async revokeRole(
    userId: number,
    roleId: number,
    revokedBy: number,
  ): Promise<RevokeRoleResponseDto> {
    const userRole = await this.userRoleRepository.findByUserIdAndRoleId(
      userId,
      roleId,
    );

    if (!userRole) {
      throw new NotFoundException('La asignación de rol no fue encontrada');
    }

    if (userRole.revoked_at) {
      throw new BadRequestException('El rol ya ha sido revocado');
    }

    const revokedAt = new Date();
    await this.userRoleRepository.update({
      id: userRole.id,
      revoked_at: revokedAt,
      revoked_by: revokedBy,
    });

    return {
      message: 'Rol revocado exitosamente',
      userId,
      roleId,
      revokedAt,
    };
  }

  async approveRole(
    userId: number,
    roleId: number,
    approvedBy: number,
  ): Promise<ApproveRoleResponseDto> {
    const userRole = await this.userRoleRepository.findByUserIdAndRoleId(
      userId,
      roleId,
    );

    if (!userRole) {
      throw new NotFoundException('La asignación de rol no fue encontrada');
    }

    if (userRole.approved_at) {
      throw new BadRequestException('El rol ya ha sido aprobado');
    }

    const approvedAt = new Date();
    await this.userRoleRepository.update({
      id: userRole.id,
      approved_at: approvedAt,
      approved_by: approvedBy,
    });

    return {
      message: 'Rol aprobado exitosamente',
      userId,
      roleId,
      approvedAt,
    };
  }
}
