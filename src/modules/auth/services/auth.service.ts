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
import { Response } from 'express';

import { MailService } from '../../../common/mail/mail.service';
import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import type { RolNombre } from '../../../database/schema/auth/roles.schema';
import type { User } from '../../../database/schema/auth/users.schema';
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
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegisterClientDto } from '../dto/register-client.dto';
import { RegisterReceptionistDto } from '../dto/register-receptionist.dto';
import { RegisterVetDto } from '../dto/register-vet.dto';
import { VerifyCodeRequestDto } from '../dto/verify-code-request.dto';

interface RequestWithCookies {
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: IUserRoleRepository,
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
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 10);

    const passwordHash = await bcrypt.hash(contrasena, 10);

    const user = await this.userRepository.create({
      email: correo,
      password_hash: passwordHash,
      verification_code: codigo,
      verification_code_expires_at: expiracion,
    });

    if (!user) {
      throw new ConflictException('Error al crear el usuario');
    }

    if (!rol.id) {
      throw new BadRequestException('El rol no tiene un id válido');
    }

    await this.userRoleRepository.create({ user, role: rol });

    await this.mailService.sendVerificationCode(correo, nombreCompleto, codigo);

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
    await this.registerUser(
      dto.nombreCompleto,
      dto.correo,
      dto.contrasena,
      ROL_NOMBRES.VETERINARIO,
      res,
    );
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

    if (!user.verification_code) {
      throw new BadRequestException('No hay código de verificación pendiente');
    }

    if (!user.verification_code_expires_at) {
      throw new BadRequestException('El código de verificación ha expirado');
    }

    if (new Date(user.verification_code_expires_at) < new Date()) {
      throw new BadRequestException('El código ingresado ha expirado');
    }

    if (user.verification_code !== dto.codigo) {
      throw new BadRequestException('El código ingresado es incorrecto');
    }

    const updatedUser: User = {
      ...user,
      email_verified_at: new Date(),
      verification_code: null,
      verification_code_expires_at: null,
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
    const updatedUser: User = {
      ...user,
      verification_code: newCode,
      verification_code_expires_at: new Date(Date.now() + 15 * 60 * 1000),
    };
    await this.userRepository.update(updatedUser);

    await this.mailService.sendVerificationCode(correo, correo, newCode);

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
