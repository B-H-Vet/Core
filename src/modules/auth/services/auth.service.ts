import { randomInt } from 'crypto';

import {
  Inject,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Response } from 'express';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import type { Database } from '../../../database/database.module';
import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import type { RolNombre } from '../../../database/schema/auth/roles.schema';
import { userRoles } from '../../../database/schema/auth/user-roles.schema';
import type { User } from '../../../database/schema/auth/users.schema';
import { users } from '../../../database/schema/auth/users.schema';
import { vetSpecialties } from '../../../database/schema/vets/vet-specialties.schema';
import { vets } from '../../../database/schema/vets/vets.schema';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../users/role/repositories/role.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../users/user/repositories/user.repository.interface';
import {
  IUserRoleRepository,
  USER_ROLE_REPOSITORY,
} from '../../users/user-role/repositories/user-role.repository.interface';
import {
  ISpecialtyRepository,
  SPECIALTY_REPOSITORY,
} from '../../vets/specialties/repositories/specialty.repository.interface';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegisterClientDto } from '../dto/register-client.dto';
import { RegisterReceptionistDto } from '../dto/register-receptionist.dto';
import { RegisterVetDto } from '../dto/register-vet.dto';
import { VerifyCodeRequestDto } from '../dto/verify-code-request.dto';

import { AuthMailService } from './auth-mail.service';
import { AuthRedisService } from './auth-redis.service';

interface RequestWithCookies {
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authMailService: AuthMailService,
    private readonly authRedisService: AuthRedisService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: IUserRoleRepository,

    @Inject(SPECIALTY_REPOSITORY)
    private readonly specialtyRepository: ISpecialtyRepository,

    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  private setVerificationCookie(res: Response, userId: number) {
    const encrypted = Buffer.from(String(userId)).toString('base64');
    res.cookie('verification_session', encrypted, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/api',
    });
  }

  private setSessionCookie(res: Response, token: string) {
    res.cookie('session_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/api',
    });
  }

  private async registerUser(
    nombreCompleto: string,
    correo: string,
    contrasena: string,
    rolNombre: RolNombre,
    res: Response,
  ) {
    const usuarioExistente = await this.userRepository.findByEmail(correo);
    if (usuarioExistente) {
      throw new ConflictException('El correo ingresado ya está registrado');
    }

    const rol = await this.roleRepository.findByName(rolNombre);
    if (!rol) {
      throw new BadRequestException('El rol ingresado no existe');
    }

    const codigo = randomInt(100000, 999999).toString();

    const passwordHash = await bcrypt.hash(contrasena, 10);

    const user = await this.userRepository.create({
      email: correo,
      password_hash: passwordHash,
    });

    if (!user) {
      throw new ConflictException('Error al crear el usuario');
    }

    if (!rol.id) {
      throw new BadRequestException('El rol no tiene un id válido');
    }

    await this.authRedisService.saveVerificationCode(user.id, codigo);

    await this.userRoleRepository.create({ user, role: rol });

    await this.authMailService.sendVerificationCode(
      correo,
      nombreCompleto,
      codigo,
    );

    this.setVerificationCookie(res, user.id);

    return user;
  }

  async registerClient(dto: RegisterClientDto, res: Response) {
    await this.registerUser(
      dto.nombreCompleto,
      dto.correo,
      dto.contrasena,
      ROL_NOMBRES.CLIENTE,
      res,
    );
    return {
      message:
        'El cliente fue registrado correctamente. Revisa tu correo para verificar tu cuenta',
    };
  }

  async registerVet(dto: RegisterVetDto, res: Response) {
    const usuarioExistente = await this.userRepository.findByEmail(dto.correo);
    if (usuarioExistente) {
      throw new ConflictException('El correo ingresado ya está registrado');
    }

    const rol = await this.roleRepository.findByName(ROL_NOMBRES.VETERINARIO);
    if (!rol) {
      throw new BadRequestException('El rol ingresado no existe');
    }

    if (!rol.id) {
      throw new BadRequestException('El rol no tiene un id válido');
    }

    if (dto.specialtyIds && dto.specialtyIds.length > 0) {
      for (const specialtyId of dto.specialtyIds) {
        const specialty = await this.specialtyRepository.findById(specialtyId);
        if (!specialty) {
          throw new BadRequestException(
            `La especialidad con id ${String(specialtyId)} no fue encontrada`,
          );
        }
      }
    }

    const codigo = randomInt(100000, 999999).toString();
    const passwordHash = await bcrypt.hash(dto.contrasena, 10);

    const user = await this.db.transaction(async (tx) => {
      await tx.insert(users).values({
        email: dto.correo,
        password_hash: passwordHash,
      });

      const [newUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, dto.correo))
        .limit(1);

      if (!newUser) {
        throw new ConflictException('Error al crear el usuario');
      }

      await tx.insert(userRoles).values({
        user_id: newUser.id,
        role_id: rol.id,
      });

      await tx.insert(vets).values({
        user_id: newUser.id,
        license_number: dto.license_number,
      });

      if (dto.specialtyIds && dto.specialtyIds.length > 0) {
        const [newVet] = await tx
          .select()
          .from(vets)
          .where(eq(vets.user_id, newUser.id))
          .limit(1);

        if (newVet) {
          await tx.insert(vetSpecialties).values(
            dto.specialtyIds.map((specialtyId) => ({
              vet_id: newVet.id,
              specialty_id: specialtyId,
            })),
          );
        }
      }

      return newUser;
    });

    await this.authRedisService.saveVerificationCode(user.id, codigo);

    await this.authMailService.sendVerificationCode(
      dto.correo,
      dto.nombreCompleto,
      codigo,
    );

    this.setVerificationCookie(res, user.id);

    return {
      message:
        'El veterinario fue registrado correctamente. Revisa tu correo para verificar tu cuenta',
    };
  }

  async registerReceptionist(dto: RegisterReceptionistDto, res: Response) {
    await this.registerUser(
      dto.nombreCompleto,
      dto.correo,
      dto.contrasena,
      ROL_NOMBRES.RECEPCIONISTA,
      res,
    );
    return {
      message:
        'El recepcionista fue registrado correctamente. Revisa tu correo para verificar tu cuenta',
    };
  }

  async verifyEmail(
    dto: VerifyCodeRequestDto,
    req: RequestWithCookies,
    res: Response,
  ) {
    const verificationSession = req.cookies.verification_session;
    if (!verificationSession) {
      throw new BadRequestException('No hay sesión de verificación activa');
    }

    const decoded = Buffer.from(verificationSession, 'base64').toString();

    const userId = parseInt(decoded, 10);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('El usuario no fue encontrado');
    }

    const storedCode = await this.authRedisService.getVerificationCode(userId);
    if (!storedCode) {
      throw new BadRequestException('El código de verificación ha expirado');
    }

    if (storedCode !== dto.codigo) {
      throw new BadRequestException('El código ingresado es incorrecto');
    }

    await this.authRedisService.deleteVerificationCode(userId);

    const updatedUser: User = {
      ...user,
      email_verified_at: new Date(),
    };
    await this.userRepository.update(updatedUser);

    const userRoles = await this.userRoleRepository.findByUserId(user.id);
    const rolActivo = userRoles.find((ur) => !ur.revoked_at);

    if (
      rolActivo?.role.name === ROL_NOMBRES.CLIENTE ||
      rolActivo?.role.name === ROL_NOMBRES.ADMINISTRADOR
    ) {
      const approvedUser: User = {
        ...user,
        approved_at: new Date(),
      };
      await this.userRepository.update(approvedUser);
    }

    res.clearCookie('verification_session');

    if (rolActivo?.role.name === ROL_NOMBRES.CLIENTE) {
      const payload = {
        sub: user.id,
        email: user.email,
        rol: rolActivo.role.name,
      };
      const token = this.jwtService.sign(payload);
      this.setSessionCookie(res, token);
    }

    return { message: 'Cuenta verificada correctamente!' };
  }

  async resendVerification(correo: string, res: Response) {
    const user = await this.userRepository.findByEmail(correo);
    if (!user) {
      throw new BadRequestException('El usuario ingresado no fue encontrado');
    }

    if (user.email_verified_at) {
      throw new BadRequestException('El correo ya fue verificado');
    }

    const newCode = randomInt(100000, 999999).toString();

    await this.authRedisService.saveVerificationCode(user.id, newCode);

    await this.authMailService.sendVerificationCode(correo, correo, newCode);

    this.setVerificationCookie(res, user.id);

    return { message: 'Código de verificación reenviado correctamente' };
  }

  async login(dto: LoginRequestDto, rolEsperado: RolNombre, res: Response) {
    const user = await this.userRepository.findByEmail(dto.correo);
    if (!user) {
      throw new UnauthorizedException(
        'Las credenciales ingresadas no son válidas',
      );
    }

    const passwordValida = await bcrypt.compare(
      dto.contrasena,
      user.password_hash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException(
        'Las credenciales ingresadas no son válidas',
      );
    }

    if (!user.email_verified_at) {
      throw new UnauthorizedException('Debes verificar tu correo primero');
    }

    if (!user.approved_at) {
      throw new UnauthorizedException('Tu cuenta aún no ha sido aprobada');
    }

    const userRoles = await this.userRoleRepository.findByUserId(user.id);
    const rolActivo = userRoles.find((ur) => !ur.revoked_at);

    if (!rolActivo) {
      throw new UnauthorizedException('El usuario no tiene un rol asignado');
    }

    if (rolActivo.role.name !== rolEsperado) {
      throw new UnauthorizedException(
        'Las credenciales ingresadas no son válidas',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      rol: rolActivo.role.name,
    };

    const token = this.jwtService.sign(payload);
    this.setSessionCookie(res, token);

    return { message: 'Inicio de sesión exitoso', rol: rolActivo.role.name };
  }
}
