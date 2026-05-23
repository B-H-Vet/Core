import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { AssignVetSpecialtiesResponseDto } from '../dto/assign-vet-specialties-response.dto';
import { AssignVetSpecialtiesDto } from '../dto/assign-vet-specialties.dto';
import { RemoveVetSpecialtyResponseDto } from '../dto/remove-vet-specialty-response.dto';
import { VetSpecialtiesService } from '../services/vet-specialties.service';

@Controller('vet-specialties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VetSpecialtiesController {
  constructor(private readonly vetSpecialtiesService: VetSpecialtiesService) {}

  @Post()
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  assign(
    @Body() dto: AssignVetSpecialtiesDto,
  ): Promise<AssignVetSpecialtiesResponseDto> {
    return this.vetSpecialtiesService.assignSpecialties(
      dto.vetId,
      dto.specialtyIds,
    );
  }

  @Delete(':vetId/:specialtyId')
  @Roles(ROL_NOMBRES.ADMINISTRADOR)
  remove(
    @Param('vetId', ParseIntPipe) vetId: number,
    @Param('specialtyId', ParseIntPipe) specialtyId: number,
  ): Promise<RemoveVetSpecialtyResponseDto> {
    return this.vetSpecialtiesService.removeSpecialty(vetId, specialtyId);
  }
}
