import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { RegisterAdminRequestDto } from '../dto/register-admin-request.dto';
import { RegisterClientDto } from '../dto/register-client.dto';
import { RegisterReceptionistDto } from '../dto/register-receptionist.dto';
import { RegisterVetDto } from '../dto/register-vet.dto';
import { RegisterAdminRequestResponseDto } from '../dto/responses/register-admin-request-response.dto';
import { RegisterClientResponseDto } from '../dto/responses/register-client-response.dto';
import { RegisterReceptionistResponseDto } from '../dto/responses/register-receptionist-response.dto';
import { RegisterVetResponseDto } from '../dto/responses/register-vet-response.dto';
import { AuthService } from '../services/auth.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly authService: AuthService) {}

  @Post('client')
  async registerClient(
    @Body() dto: RegisterClientDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterClientResponseDto> {
    return this.authService.registerClient(dto, res);
  }

  @Post('vet')
  async registerVet(
    @Body() dto: RegisterVetDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterVetResponseDto> {
    return this.authService.registerVet(dto, res);
  }

  @Post('admin-request')
  async registerAdminRequest(
    @Body() dto: RegisterAdminRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterAdminRequestResponseDto> {
    return this.authService.registerAdminRequest(dto, res);
  }

  @Post('receptionist')
  async registerReceptionist(
    @Body() dto: RegisterReceptionistDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterReceptionistResponseDto> {
    return this.authService.registerReceptionist(dto, res);
  }
}
