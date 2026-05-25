import { randomInt } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Response } from 'express';

import {
  BadRequestBusinessException,
  ConflictBusinessException,
  InternalServerBusinessException,
  NotFoundBusinessException,
  UnauthorizedBusinessException,
} from '../../../common/exceptions';
import { RequestWithCookies } from '../../../common/types/express.types';
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
  CLIENT_REPOSITORY,
  IClientRepository,
} from '../../clients/repositories/client.repository.interface';
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
import {
  VET_REPOSITORY,
  IVetRepository,
} from '../../vets/vet/repositories/vet.repository.interface';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginUserSummaryDto } from '../dto/login-user-summary.dto';
import { RegisterAdminRequestDto } from '../dto/register-admin-request.dto';
import { RegisterClientDto } from '../dto/register-client.dto';
import { RegisterReceptionistDto } from '../dto/register-receptionist.dto';
import { RegisterVetDto } from '../dto/register-vet.dto';
import { LoginAdminResponseDto } from '../dto/responses/login-admin-response.dto';
import { LoginClientResponseDto } from '../dto/responses/login-client-response.dto';
import { LoginReceptionistResponseDto } from '../dto/responses/login-receptionist-response.dto';
import { LoginVetResponseDto } from '../dto/responses/login-vet-response.dto';
import { RegisterAdminRequestResponseDto } from '../dto/responses/register-admin-request-response.dto';
import { RegisterClientResponseDto } from '../dto/responses/register-client-response.dto';
import { RegisterReceptionistResponseDto } from '../dto/responses/register-receptionist-response.dto';
import { RegisterVetResponseDto } from '../dto/responses/register-vet-response.dto';
import { ResendVerificationResponseDto } from '../dto/responses/resend-verification-response.dto';
import { VerifyEmailResponseDto } from '../dto/responses/verify-email-response.dto';
import { VerifyCodeRequestDto } from '../dto/verify-code-request.dto';

import { AuthMailService } from './auth-mail.service';
import { AuthRedisService } from './auth-redis.service';

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

    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  private setVerificationCookie(res: Response, userId: number) {
    const encrypted = Buffer.from(String(userId)).toString('base64');
    res.cookie('verification_session', encrypted, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
  }

  private setAccessTokenCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });
  }

  private setRefreshTokenCookie(res: Response, tokenId: string) {
    res.cookie('refresh_token', tokenId, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('verification_session');
  }

  private async registerUser(
    fullName: string,
    email: string,
    password: string,
    roleName: RolNombre,
    res: Response,
  ) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictBusinessException(
        'EMAIL_ALREADY_REGISTERED',
        'The entered email is already registered',
      );
    }

    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new NotFoundBusinessException(
        'ROLE_NOT_FOUND',
        'The entered role does not exist',
      );
    }

    const code = randomInt(100000, 999999).toString();

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      name: fullName,
      email,
      password_hash: passwordHash,
    });

    if (!user) {
      throw new InternalServerBusinessException(
        'USER_CREATION_FAILED',
        'Failed to create user',
      );
    }

    if (!role.id) {
      throw new BadRequestBusinessException(
        'ROLE_INVALID_ID',
        'The role does not have a valid id',
      );
    }

    await this.authRedisService.saveVerificationCode(user.id, code);

    await this.userRoleRepository.create({ user, role });

    await this.authMailService.sendVerificationCode(email, fullName, code);

    this.setVerificationCookie(res, user.id);

    return user;
  }

  async registerClient(
    dto: RegisterClientDto,
    res: Response,
  ): Promise<RegisterClientResponseDto> {
    const user = await this.registerUser(
      dto.fullName,
      dto.email,
      dto.password,
      ROL_NOMBRES.CLIENTE,
      res,
    );

    await this.clientRepository.create({
      user: { id: user.id },
      phone: dto.phone,
      ...(dto.address !== undefined && { address: dto.address }),
    });

    return {
      message:
        'The client was registered successfully. Check your email to verify your account',
    };
  }

  async registerVet(
    dto: RegisterVetDto,
    res: Response,
  ): Promise<RegisterVetResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictBusinessException(
        'EMAIL_ALREADY_REGISTERED',
        'The entered email is already registered',
      );
    }

    const role = await this.roleRepository.findByName(ROL_NOMBRES.VETERINARIO);
    if (!role) {
      throw new NotFoundBusinessException(
        'ROLE_NOT_FOUND',
        'The entered role does not exist',
      );
    }

    if (!role.id) {
      throw new BadRequestBusinessException(
        'ROLE_INVALID_ID',
        'The role does not have a valid id',
      );
    }

    if (dto.specialtyIds && dto.specialtyIds.length > 0) {
      for (const specialtyId of dto.specialtyIds) {
        const specialty = await this.specialtyRepository.findById(specialtyId);
        if (!specialty) {
          throw new NotFoundBusinessException(
            'SPECIALTY_NOT_FOUND',
            `The specialty with id ${String(specialtyId)} was not found`,
          );
        }
      }
    }

    const code = randomInt(100000, 999999).toString();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.db.transaction(async (tx) => {
      await tx.insert(users).values({
        name: dto.fullName,
        email: dto.email,
        password_hash: passwordHash,
      });

      const [newUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, dto.email))
        .limit(1);

      if (!newUser) {
        throw new InternalServerBusinessException(
          'USER_CREATION_FAILED',
          'Failed to create user',
        );
      }

      await tx.insert(userRoles).values({
        user_id: newUser.id,
        role_id: role.id,
      });

      await tx.insert(vets).values({
        user_id: newUser.id,
        license_number: dto.licenseNumber,
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

    await this.authRedisService.saveVerificationCode(user.id, code);

    await this.authMailService.sendVerificationCode(
      dto.email,
      dto.fullName,
      code,
    );

    this.setVerificationCookie(res, user.id);

    return {
      message:
        'The veterinarian was registered successfully. Check your email to verify your account',
    };
  }

  async registerReceptionist(
    dto: RegisterReceptionistDto,
    res: Response,
  ): Promise<RegisterReceptionistResponseDto> {
    await this.registerUser(
      dto.fullName,
      dto.email,
      dto.password,
      ROL_NOMBRES.RECEPCIONISTA,
      res,
    );
    return {
      message:
        'The receptionist was registered successfully. Check your email to verify your account',
    };
  }

  async registerAdminRequest(
    dto: RegisterAdminRequestDto,
    res: Response,
  ): Promise<RegisterAdminRequestResponseDto> {
    await this.registerUser(
      dto.fullName,
      dto.email,
      dto.password,
      ROL_NOMBRES.ADMINISTRADOR,
      res,
    );
    return {
      message:
        'The admin registration was requested successfully. Check your email to verify your account. An existing administrator must approve your account before you can log in.',
    };
  }

  async verifyEmail(
    dto: VerifyCodeRequestDto,
    req: RequestWithCookies,
    res: Response,
  ): Promise<VerifyEmailResponseDto> {
    const verificationSession = req.cookies.verification_session;
    if (!verificationSession) {
      throw new BadRequestBusinessException(
        'NO_VERIFICATION_SESSION',
        'There is no active verification session',
      );
    }

    const decoded = Buffer.from(verificationSession, 'base64').toString();

    const userId = parseInt(decoded, 10);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundBusinessException(
        'USER_NOT_FOUND',
        'The user was not found',
      );
    }

    const storedCode = await this.authRedisService.getVerificationCode(userId);
    if (!storedCode) {
      throw new BadRequestBusinessException(
        'VERIFICATION_EXPIRED',
        'The verification code has expired',
      );
    }

    if (storedCode !== dto.code) {
      throw new BadRequestBusinessException(
        'INVALID_VERIFICATION_CODE',
        'The entered code is incorrect',
      );
    }

    await this.authRedisService.deleteVerificationCode(userId);

    const updatedUser: User = {
      ...user,
      email_verified_at: new Date(),
    };
    await this.userRepository.update(updatedUser);

    const userRolesList = await this.userRoleRepository.findByUserId(user.id);
    const activeRole = userRolesList.find((ur) => !ur.revoked_at);

    const shouldAutoLogin = activeRole?.role.requires_approval === false;

    res.clearCookie('verification_session');

    if (shouldAutoLogin) {
      const profileId = await this.getProfileId(user.id, activeRole.role.name);
      const payload = {
        sub: user.id,
        email: user.email,
        rol: activeRole.role.name,
        profileId,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.authRedisService.createRefreshToken(
        user.id,
      );
      this.setAccessTokenCookie(res, accessToken);
      this.setRefreshTokenCookie(res, refreshToken);
    }

    return { message: 'Account verified successfully!' };
  }

  async resendVerification(
    email: string,
    res: Response,
  ): Promise<ResendVerificationResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundBusinessException(
        'USER_NOT_FOUND',
        'The entered user was not found',
      );
    }

    if (user.email_verified_at) {
      throw new BadRequestBusinessException(
        'EMAIL_ALREADY_VERIFIED',
        'The email has already been verified',
      );
    }

    const newCode = randomInt(100000, 999999).toString();

    await this.authRedisService.saveVerificationCode(user.id, newCode);

    await this.authMailService.sendVerificationCode(email, email, newCode);

    this.setVerificationCookie(res, user.id);

    return { message: 'Verification code resent successfully' };
  }

  private async getProfileId(
    userId: number,
    rol: string,
  ): Promise<number | null> {
    if (rol === ROL_NOMBRES.CLIENTE) {
      const client = await this.clientRepository.findByUserId(userId);
      return client?.id ?? null;
    }
    if (rol === ROL_NOMBRES.VETERINARIO) {
      const vet = await this.vetRepository.findByUserId(userId);
      return vet?.id ?? null;
    }
    return null;
  }

  private async loginCore(
    dto: LoginRequestDto,
    expectedRole: RolNombre,
    res: Response,
  ): Promise<{
    user: LoginUserSummaryDto;
    role: string;
    profile: unknown;
  }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedBusinessException(
        'INVALID_CREDENTIALS',
        'The entered credentials are not valid',
      );
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!passwordValid) {
      throw new UnauthorizedBusinessException(
        'INVALID_CREDENTIALS',
        'The entered credentials are not valid',
      );
    }

    if (!user.email_verified_at) {
      throw new UnauthorizedBusinessException(
        'EMAIL_NOT_VERIFIED',
        'You must verify your email first',
      );
    }

    const userRolesList = await this.userRoleRepository.findByUserId(user.id);
    const activeRole = userRolesList.find((ur) => !ur.revoked_at);

    if (!activeRole) {
      throw new UnauthorizedBusinessException(
        'NO_ROLE_ASSIGNED',
        'The user does not have an assigned role',
      );
    }

    if (activeRole.role.requires_approval && !activeRole.approved_at) {
      throw new UnauthorizedBusinessException(
        'ACCOUNT_NOT_APPROVED',
        'Your account has not been approved yet',
      );
    }

    if (activeRole.role.name !== expectedRole) {
      throw new UnauthorizedBusinessException(
        'INVALID_CREDENTIALS',
        'The entered credentials are not valid',
      );
    }

    const profileId = await this.getProfileId(user.id, activeRole.role.name);
    const payload = {
      sub: user.id,
      email: user.email,
      rol: activeRole.role.name,
      profileId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.authRedisService.createRefreshToken(
      user.id,
    );
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);

    const userSummary: LoginUserSummaryDto = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    let profile: unknown = null;

    if (activeRole.role.name === ROL_NOMBRES.CLIENTE) {
      const client = await this.clientRepository.findByUserId(user.id);
      if (client) {
        profile = {
          id: client.id,
          phone: client.phone,
          address: client.address,
        };
      }
    } else if (activeRole.role.name === ROL_NOMBRES.VETERINARIO) {
      const vet = await this.vetRepository.findByUserId(user.id);
      if (vet) {
        profile = {
          id: vet.id,
          licenseNumber: vet.license_number,
        };
      }
    }

    return {
      user: userSummary,
      role: activeRole.role.name,
      profile,
    };
  }

  async loginClient(
    dto: LoginRequestDto,
    res: Response,
  ): Promise<LoginClientResponseDto> {
    const result = await this.loginCore(dto, ROL_NOMBRES.CLIENTE, res);
    return {
      message: 'Login successful',
      user: result.user,
      role: result.role,
      profile: result.profile as {
        id: number;
        phone: string;
        address: string | null;
      },
    };
  }

  async loginVet(
    dto: LoginRequestDto,
    res: Response,
  ): Promise<LoginVetResponseDto> {
    const result = await this.loginCore(dto, ROL_NOMBRES.VETERINARIO, res);
    return {
      message: 'Login successful',
      user: result.user,
      role: result.role,
      profile: result.profile as { id: number; licenseNumber: string },
    };
  }

  async loginReceptionist(
    dto: LoginRequestDto,
    res: Response,
  ): Promise<LoginReceptionistResponseDto> {
    const result = await this.loginCore(dto, ROL_NOMBRES.RECEPCIONISTA, res);
    return {
      message: 'Login successful',
      user: result.user,
      role: result.role,
      profile: null,
    };
  }

  async loginAdmin(
    dto: LoginRequestDto,
    res: Response,
  ): Promise<LoginAdminResponseDto> {
    const result = await this.loginCore(dto, ROL_NOMBRES.ADMINISTRADOR, res);
    return {
      message: 'Login successful',
      user: result.user,
      role: result.role,
      profile: null,
    };
  }

  async refreshTokens(
    req: RequestWithCookies,
    res: Response,
  ): Promise<{ message: string; user: LoginUserSummaryDto; role: string }> {
    const refreshTokenId = req.cookies.refresh_token;
    if (!refreshTokenId) {
      throw new UnauthorizedBusinessException(
        'NO_REFRESH_TOKEN',
        'Refresh token is missing',
      );
    }

    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      throw new UnauthorizedBusinessException(
        'NO_ACCESS_TOKEN',
        'Access token is missing',
      );
    }

    let payload: {
      sub: number;
      email: string;
      rol: string;
      profileId: number | null;
    };
    try {
      payload = this.jwtService.verify(accessToken);
    } catch {
      throw new UnauthorizedBusinessException(
        'INVALID_ACCESS_TOKEN',
        'Access token is invalid',
      );
    }

    const userId = payload.sub;
    const isValid = await this.authRedisService.validateRefreshToken(
      userId,
      refreshTokenId,
    );

    if (!isValid) {
      throw new UnauthorizedBusinessException(
        'INVALID_REFRESH_TOKEN',
        'Refresh token is invalid or expired',
      );
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedBusinessException(
        'USER_NOT_FOUND',
        'User not found',
      );
    }

    const userRolesList = await this.userRoleRepository.findByUserId(user.id);
    const activeRole = userRolesList.find((ur) => !ur.revoked_at);

    if (!activeRole) {
      throw new UnauthorizedBusinessException(
        'NO_ROLE_ASSIGNED',
        'The user does not have an assigned role',
      );
    }

    const profileId = await this.getProfileId(user.id, activeRole.role.name);
    const newPayload = {
      sub: user.id,
      email: user.email,
      rol: activeRole.role.name,
      profileId,
    };

    const newAccessToken = this.jwtService.sign(newPayload);

    await this.authRedisService.revokeRefreshToken(userId, refreshTokenId);
    const newRefreshToken =
      await this.authRedisService.createRefreshToken(userId);

    this.setAccessTokenCookie(res, newAccessToken);
    this.setRefreshTokenCookie(res, newRefreshToken);

    return {
      message: 'Tokens refreshed successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      role: activeRole.role.name,
    };
  }

  async logout(
    req: RequestWithCookies,
    res: Response,
  ): Promise<{ message: string }> {
    const refreshTokenId = req.cookies.refresh_token;
    const accessToken = req.cookies.access_token;

    if (accessToken) {
      try {
        const payload = this.jwtService.verify<{ sub: number }>(accessToken);
        if (refreshTokenId) {
          await this.authRedisService.revokeRefreshToken(
            payload.sub,
            refreshTokenId,
          );
        }
      } catch {
        // Token inválido, continuar limpiando cookies
      }
    }

    this.clearAuthCookies(res);

    return { message: 'Session closed successfully' };
  }
}
