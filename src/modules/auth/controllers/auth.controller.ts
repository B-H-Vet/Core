import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';

import { LoginRequestDto } from '../dto/login-request.dto';
import { VerifyCodeRequestDto } from '../dto/verify-code-request.dto';
import { AuthService } from '../services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/verify-email')
  async verifyEmail(
    @Body() dto: VerifyCodeRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyEmail(dto, req, res);
  }

  @Post('auth/resend-verification')
  async resendVerification(
    @Body() body: { correo: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.resendVerification(body.correo, res);
  }

  @Post('auth/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('session_token');
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('login/client')
  async loginClient(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, 'CLIENTE', res);
  }

  @Post('login/vet')
  async loginVet(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, 'VETERINARIO', res);
  }

  @Post('login/receptionist')
  async loginReceptionist(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, 'RECEPCIONISTA', res);
  }

  @Post('login/admin')
  async loginAdmin(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, 'ADMINISTRADOR', res);
  }
}
