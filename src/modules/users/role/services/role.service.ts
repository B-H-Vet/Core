import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import type {
  Role,
  NewRole,
  RolNombre,
} from '../../../../database/schema/auth/roles.schema';
import type { CreateRoleResponseDto } from '../dto/create-role-response.dto';
import type { CreateRoleDto } from '../dto/create-role.dto';
import type { DeleteRoleResponseDto } from '../dto/delete-role-response.dto';
import type { RoleDetailResponseDto } from '../dto/role-detail-response.dto';
import type { RoleListResponseDto } from '../dto/role-list-response.dto';
import type { RoleResponseDto } from '../dto/role-response.dto';
import type { UpdateRoleResponseDto } from '../dto/update-role-response.dto';
import type { UpdateRoleDto } from '../dto/update-role.dto';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../repositories/role.repository.interface';

import type { IRoleService, PaginationParams } from './role.service.interface';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async findAll(pagination?: PaginationParams): Promise<RoleListResponseDto> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const roles = await this.roleRepository.findAll();
    const allData = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      requires_approval: role.requires_approval,
      is_active: role.is_active,
      created_at: role.created_at,
      updated_at: role.updated_at,
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

  async findById(id: number): Promise<RoleDetailResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('El rol no fue encontrado');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      requires_approval: role.requires_approval,
      is_active: role.is_active,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
  }

  async findByName(name: RolNombre): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new NotFoundException(`El rol ${name} no fue encontrado`);
    }

    return this.toRoleItemDto(role);
  }

  async create(createRoleDto: CreateRoleDto): Promise<CreateRoleResponseDto> {
    const existingRole = await this.roleRepository.findByName(
      createRoleDto.name,
    );
    if (existingRole) {
      throw new BadRequestException('El rol ya existe');
    }

    const newRolePayload: NewRole = {
      name: createRoleDto.name,
      description: createRoleDto.description ?? null,
      requires_approval: createRoleDto.requiresApproval ?? false,
    };
    const newRole = await this.roleRepository.create(newRolePayload);

    if (!newRole) {
      throw new BadRequestException('No se pudo crear el rol');
    }

    return {
      message: 'Rol creado exitosamente',
      data: {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description,
        requires_approval: newRole.requires_approval,
        is_active: newRole.is_active,
        created_at: newRole.created_at,
        updated_at: newRole.updated_at,
      },
    };
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateRoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('El rol no fue encontrado');
    }

    const updatedRole = await this.roleRepository.update({
      ...role,
      description: updateRoleDto.description ?? role.description,
      requires_approval:
        updateRoleDto.requiresApproval ?? role.requires_approval,
      is_active: updateRoleDto.isActive ?? role.is_active,
    });

    if (!updatedRole) {
      throw new BadRequestException('No se pudo actualizar el rol');
    }

    return {
      message: 'Rol actualizado exitosamente',
      data: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        requires_approval: updatedRole.requires_approval,
        is_active: updatedRole.is_active,
        created_at: updatedRole.created_at,
        updated_at: updatedRole.updated_at,
      },
    };
  }

  async delete(id: number): Promise<DeleteRoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('El rol no fue encontrado');
    }

    await this.roleRepository.delete(id);

    return {
      message: 'Rol eliminado exitosamente',
      roleId: id,
      deletedAt: new Date(),
    };
  }

  private toRoleItemDto(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      requires_approval: role.requires_approval,
      is_active: role.is_active,
    };
  }
}
