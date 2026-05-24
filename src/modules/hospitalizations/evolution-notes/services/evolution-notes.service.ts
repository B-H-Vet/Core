import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  IVetRepository,
  VET_REPOSITORY,
} from '../../../vets/vet/repositories/vet.repository.interface';
import {
  HOSPITALIZATION_REPOSITORY,
  IHospitalizationRepository,
} from '../../hospitalization/repositories/hospitalization.repository.interface';
import { CreateEvolutionNoteResponseDto } from '../dto/create-evolution-note-response.dto';
import {
  EVOLUTION_NOTE_REPOSITORY,
  IEvolutionNoteRepository,
} from '../repositories/evolution-note.repository.interface';

interface AuthenticatedUser {
  id: number;
  rol: string;
}

@Injectable()
export class EvolutionNotesService {
  constructor(
    @Inject(EVOLUTION_NOTE_REPOSITORY)
    private readonly evolutionNoteRepository: IEvolutionNoteRepository,

    @Inject(HOSPITALIZATION_REPOSITORY)
    private readonly hospitalizationRepository: IHospitalizationRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,
  ) {}

  async create(
    hospitalizationId: number,
    note: string,
    user: AuthenticatedUser,
  ): Promise<CreateEvolutionNoteResponseDto> {
    const vet = await this.vetRepository.findByUserId(user.id);

    if (!vet) {
      throw new ForbiddenException(
        'Solo los veterinarios pueden agregar notas de evolución',
      );
    }

    const hospitalization =
      await this.hospitalizationRepository.findById(hospitalizationId);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    if (hospitalization.egress_date) {
      throw new BadRequestException(
        'No se pueden agregar notas a una hospitalización cerrada',
      );
    }

    const created = await this.evolutionNoteRepository.create({
      hospitalization_id: hospitalizationId,
      vet_id: vet.id,
      note,
    });

    return {
      id: created.id,
      hospitalization_id: created.hospitalization_id,
      vet_id: created.vet_id,
      note: created.note,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  }

  async findByHospitalizationId(hospitalizationId: number) {
    return this.evolutionNoteRepository.findByHospitalizationId(
      hospitalizationId,
    );
  }

  async softDeleteByHospitalizationId(hospitalizationId: number) {
    return this.evolutionNoteRepository.softDeleteByHospitalizationId(
      hospitalizationId,
    );
  }
}
