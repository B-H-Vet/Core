import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { Roles } from '../decorators/roles.decorator';
import { RegisterClientDto } from '../dto/register-client.dto';
import { RegisterReceptionistDto } from '../dto/register-receptionist.dto';
import { RegisterVetDto } from '../dto/register-vet.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthService } from '../services/auth.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly authService: AuthService) {}

  @Post('client')
  async registerClient(
    @Body() dto: RegisterClientDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerClient(dto, res);
  }

  @Post('vet')
  async registerVet(
    @Body() dto: RegisterVetDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerVet(dto, res);
  }

  @Post('receptionist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  async registerReceptionist(
    @Body() dto: RegisterReceptionistDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerReceptionist(dto, res);
  }
}
