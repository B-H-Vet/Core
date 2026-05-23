import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import type {
  User,
  NewUser,
} from '../../../../database/schema/auth/users.schema';
import {
  IUserRoleRepository,
  USER_ROLE_REPOSITORY,
  type UserRoleWithRole,
} from '../../user-role/repositories/user-role.repository.interface';
import type { ApproveUserResponseDto } from '../dto/approve-user-response.dto';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { DeactivateUserResponseDto } from '../dto/deactivate-user-response.dto';
import type { PendingUsersResponseDto } from '../dto/pending-users-response.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { UserDetailResponseDto } from '../dto/user-detail-response.dto';
import type { UserListResponseDto } from '../dto/user-list-response.dto';
import type { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../repositories/user.repository.interface';

import type { IUserService, PaginationParams } from './user.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async findAll(pagination?: PaginationParams): Promise<UserListResponseDto> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const users = await this.userRepository.findAll();
    const userRolesMap = new Map<number, UserRoleWithRole[]>();

    for (const u of users) {
      const userRoles = await this.userRoleRepository.findByUserId(u.id);
      userRolesMap.set(u.id, userRoles);
    }

    const allData = UserMapper.toDtoList(users, userRolesMap);
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

  async findById(id: number): Promise<UserDetailResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('El usuario no fue encontrado');
    }

    const userRoles = await this.userRoleRepository.findByUserId(user.id);
    const baseDto = UserMapper.toDto(user, userRoles);

    const roles = userRoles.map((ur) => ({
      id: ur.id,
      name: ur.role.name,
      assigned_at: ur.assigned_at,
      approved_at: ur.approved_at,
      revoked_at: ur.revoked_at,
    }));

    return {
      id: baseDto.id,
      email: baseDto.email,
      email_verified_at: baseDto.email_verified_at,
      approved_at: baseDto.approved_at,
      created_at: baseDto.created_at,
      updated_at: user.updated_at,
      rol: baseDto.rol,
      roles,
    };
  }

  async findByIdEntity(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('El usuario no fue encontrado');
    }
    return user;
  }

  async findPendientesAprobacion(
    pagination?: PaginationParams,
  ): Promise<PendingUsersResponseDto> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const users = await this.userRepository.findAll();
    const pendientes: UserResponseDto[] = [];

    for (const u of users) {
      const userRoles = await this.userRoleRepository.findByUserId(u.id);
      const rolActivo = userRoles.find((ur) => !ur.revoked_at);

      if (
        u.email_verified_at !== null &&
        u.approved_at === null &&
        rolActivo?.role.requires_approval === true
      ) {
        pendientes.push(UserMapper.toDto(u, userRoles));
      }
    }

    const total = pendientes.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = pendientes.slice(startIndex, startIndex + limit);

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

  async aprobarCuenta(
    id: number,
    adminId: number,
  ): Promise<ApproveUserResponseDto> {
    const user = await this.findByIdEntity(id);

    if (!user.email_verified_at) {
      throw new BadRequestException(
        'El usuario aún no ha verificado su correo',
      );
    }

    const userRoles = await this.userRoleRepository.findByUserId(id);
    const rolActivo = userRoles.find((ur) => !ur.revoked_at);

    if (!rolActivo) {
      throw new BadRequestException('El usuario no tiene un rol asignado');
    }

    if (rolActivo.role.name === ROL_NOMBRES.CLIENTE) {
      throw new BadRequestException(
        'Los clientes no requieren aprobación manual',
      );
    }

    if (rolActivo.approved_at) {
      throw new BadRequestException('La cuenta ya está aprobada');
    }

    const approvedAt = new Date();

    await this.userRoleRepository.update({
      id: rolActivo.id,
      approved_at: approvedAt,
      approved_by: adminId,
    });

    const updatedUserPayload: User = {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      email_verified_at: user.email_verified_at,
      approved_at: approvedAt,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
    };
    await this.userRepository.update(updatedUserPayload);

    return {
      message: 'La cuenta ha sido aprobada correctamente',
      userId: id,
      approvedAt,
    };
  }

  async desactivarCuenta(
    id: number,
    adminId: number,
  ): Promise<DeactivateUserResponseDto> {
    await this.findByIdEntity(id);
    const deactivatedAt = new Date();
    await this.userRoleRepository.revokeByUserId(id, adminId);

    return {
      message: 'La cuenta ha sido desactivada correctamente',
      userId: id,
      deactivatedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const newUserPayload: NewUser = {
      email: createUserDto.email,
      password_hash: createUserDto.password,
    };
    const newUser = await this.userRepository.create(newUserPayload);

    if (!newUser) {
      throw new BadRequestException('No se pudo crear el usuario');
    }

    return UserMapper.toDto(newUser);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findByIdEntity(id);

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    const updatedUserPayload: User = {
      id: user.id,
      email: updateUserDto.email ?? user.email,
      password_hash: updateUserDto.password ?? user.password_hash,
      email_verified_at: user.email_verified_at,
      approved_at: user.approved_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
    };
    const updatedUser = await this.userRepository.update(updatedUserPayload);

    if (!updatedUser) {
      throw new BadRequestException('No se pudo actualizar el usuario');
    }

    return UserMapper.toDto(updatedUser);
  }

  async delete(id: number): Promise<void> {
    await this.findByIdEntity(id);
    await this.userRepository.delete(id);
  }
}
