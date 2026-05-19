import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { RolNombre } from '../../../database/schema/auth/roles.schema';
import { User } from '../../../database/schema/auth/users.schema';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import {
  IUserRoleRepository,
  USER_ROLE_REPOSITORY,
} from '../repositories/user-role.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../repositories/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    const resultado: UserResponseDto[] = [];
    for (const u of users) {
      const userRoles = await u.userRoles;
      resultado.push(UserMapper.toDto(u, userRoles));
    }
    return resultado;
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('El usuario no fue encontrado');
    }
    const userRoles = await user.userRoles;
    return UserMapper.toDto(user, userRoles);
  }

  async findByIdEntity(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('El usuario no fue encontrado');
    }
    return user;
  }

  async findPendientesAprobacion(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    const resultado: UserResponseDto[] = [];
    for (const u of users) {
      const userRoles = await u.userRoles;
      const rolActivo = userRoles?.find((ur: any) => !ur.revoked_at);
      if (
        u.email_verified_at !== null &&
        u.approved_at === null &&
        rolActivo?.role?.requires_approval === true
      ) {
        resultado.push(UserMapper.toDto(u, userRoles));
      }
    }
    return resultado;
  }

  async aprobarCuenta(id: number, adminId: number): Promise<string> {
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

    if (rolActivo.role.name === RolNombre.CLIENTE) {
      throw new BadRequestException(
        'Los clientes no requieren aprobación manual',
      );
    }

    if (rolActivo.approved_at) {
      throw new BadRequestException('La cuenta ya está aprobada');
    }

    rolActivo.approved_at = new Date();
    rolActivo.approved_by = adminId;
    await this.userRoleRepository.update(rolActivo);

    user.approved_at = new Date();
    await this.userRepository.update(user);

    return 'La cuenta ha sido aprobada correctamente';
  }

  async desactivarCuenta(id: number, adminId: number): Promise<string> {
    await this.findByIdEntity(id);
    await this.userRoleRepository.revokeByUserId(id, adminId);
    return 'La cuenta ha sido desactivada correctamente';
  }
}
