import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateEvolutionNoteDto } from '../dto/create-evolution-note.dto';
import { CreateHospitalizationDto } from '../dto/create-hospitalization.dto';
import { DischargeHospitalizationDto } from '../dto/discharge-hospitalization.dto';
import {
  EVOLUTION_NOTE_REPOSITORY,
  IEvolutionNoteRepository,
} from '../repositories/evolution-note.repository.interface';
import {
  HOSPITALIZATION_REPOSITORY,
  IHospitalizationRepository,
} from '../repositories/hospitalization.repository.interface';

@Injectable()
export class HospitalizationsService {
  constructor(
    @Inject(HOSPITALIZATION_REPOSITORY)
    private readonly hospitalizationRepository: IHospitalizationRepository,

    @Inject(EVOLUTION_NOTE_REPOSITORY)
    private readonly evolutionNoteRepository: IEvolutionNoteRepository,
  ) {}

  async create(dto: CreateHospitalizationDto) {
    const active = await this.hospitalizationRepository.findActiveByPetId(
      dto.pet_id,
    );

    if (active) {
      throw new BadRequestException(
        'La mascota ya tiene una hospitalización activa',
      );
    }

    return this.hospitalizationRepository.create(dto.pet_id);
  }

  async findAll() {
    return this.hospitalizationRepository.findAll();
  }

  async findById(id: number) {
    const hospitalization = await this.hospitalizationRepository.findById(id);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    const notes =
      await this.evolutionNoteRepository.findByHospitalizationId(id);

    return {
      ...hospitalization,
      evolution_notes: notes,
    };
  }

  async findByPetId(petId: number) {
    return this.hospitalizationRepository.findByPetId(petId);
  }

  async createEvolutionNote(
    hospitalizationId: number,
    dto: CreateEvolutionNoteDto,
  ) {
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

    return this.evolutionNoteRepository.create({
      hospitalization_id: hospitalizationId,
      note: dto.note,
    });
  }

  async discharge(id: number, dto: DischargeHospitalizationDto) {
    const hospitalization = await this.hospitalizationRepository.findById(id);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    if (hospitalization.egress_date) {
      throw new BadRequestException('La hospitalización ya fue dada de alta');
    }

    return this.hospitalizationRepository.discharge({
      id,
      egress_status: dto.egress_status,
    });
  }

  async delete(id: number) {
    const hospitalization = await this.hospitalizationRepository.findById(id);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    await this.evolutionNoteRepository.softDeleteByHospitalizationId(id);
    await this.hospitalizationRepository.softDelete(id);

    return {
      id,
      message: 'La hospitalización fue eliminada correctamente',
      deleted_at: new Date(),
    };
  }
}
