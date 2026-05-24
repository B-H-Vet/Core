import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateEvolutionNoteResponseDto } from '../dto/create-evolution-note-response.dto';
import { CreateEvolutionNoteDto } from '../dto/create-evolution-note.dto';
import { EvolutionNotesService } from '../services/evolution-notes.service';

interface AuthenticatedUser {
  id: number;
  rol: string;
}

@Controller('hospitalizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvolutionNotesController {
  constructor(private readonly evolutionNotesService: EvolutionNotesService) {}

  @Post(':id/evolution-notes')
  @Roles(ROL_NOMBRES.VETERINARIO)
  create(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEvolutionNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CreateEvolutionNoteResponseDto> {
    return this.evolutionNotesService.create(id, dto.note, user);
  }
}
