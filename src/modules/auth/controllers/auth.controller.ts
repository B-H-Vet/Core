import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';

import { RequestWithCookies } from '../../../common/types/express.types';
import { LoginRequestDto } from '../dto/login-request.dto';
import { ResendVerificationRequestDto } from '../dto/resend-verification-request.dto';
import { LoginAdminResponseDto } from '../dto/responses/login-admin-response.dto';
import { LoginClientResponseDto } from '../dto/responses/login-client-response.dto';
import { LoginReceptionistResponseDto } from '../dto/responses/login-receptionist-response.dto';
import { LoginVetResponseDto } from '../dto/responses/login-vet-response.dto';
import { LogoutResponseDto } from '../dto/responses/logout-response.dto';
import { ResendVerificationResponseDto } from '../dto/responses/resend-verification-response.dto';
import { VerifyEmailResponseDto } from '../dto/responses/verify-email-response.dto';
import { VerifyCodeRequestDto } from '../dto/verify-code-request.dto';
import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/verify-email')
  async verifyEmail(
    @Body() dto: VerifyCodeRequestDto,
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(dto, req, res);
  }

  @Post('auth/resend-verification')
  async resendVerification(
    @Body() dto: ResendVerificationRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResendVerificationResponseDto> {
    return this.authService.resendVerification(dto.email, res);
  }

  @Post('auth/refresh')
  async refreshTokens(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
    user: { id: number; name: string; email: string };
    role: string;
  }> {
    return this.authService.refreshTokens(req, res);
  }

  @Post('auth/logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    return this.authService.logout(req, res);
  }

  @Post('login/client')
  async loginClient(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginClientResponseDto> {
    return this.authService.loginClient(dto, res);
  }

  @Post('login/vet')
  async loginVet(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginVetResponseDto> {
    return this.authService.loginVet(dto, res);
  }

  @Post('login/receptionist')
  async loginReceptionist(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginReceptionistResponseDto> {
    return this.authService.loginReceptionist(dto, res);
  }

  @Post('login/admin')
  async loginAdmin(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginAdminResponseDto> {
    return this.authService.loginAdmin(dto, res);
  }
}
