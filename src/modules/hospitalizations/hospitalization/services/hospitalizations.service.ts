import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ROL_NOMBRES } from '../../../../database/schema/auth/roles.schema';
import type { EvolutionNote } from '../../../../database/schema/hospitalizations/evolution-notes.schema';
import type { Hospitalization } from '../../../../database/schema/hospitalizations/hospitalizations.schema';
import {
  IClientRepository,
  CLIENT_REPOSITORY,
} from '../../../clients/repositories/client.repository.interface';
import {
  IPetRepository,
  PET_REPOSITORY,
} from '../../../pets/repositories/pet.repository.interface';
import {
  IVetRepository,
  VET_REPOSITORY,
} from '../../../vets/vet/repositories/vet.repository.interface';
import { EvolutionNotesService } from '../../evolution-notes/services/evolution-notes.service';
import { CreateHospitalizationResponseDto } from '../dto/create-hospitalization-response.dto';
import { CreateHospitalizationDto } from '../dto/create-hospitalization.dto';
import { DeleteHospitalizationResponseDto } from '../dto/delete-hospitalization-response.dto';
import { DischargeHospitalizationResponseDto } from '../dto/discharge-hospitalization-response.dto';
import { DischargeHospitalizationDto } from '../dto/discharge-hospitalization.dto';
import { FindAllHospitalizationsResponseDto } from '../dto/find-all-hospitalizations-response.dto';
import { FindHospitalizationByIdResponseDto } from '../dto/find-hospitalization-by-id-response.dto';
import { FindHospitalizationsByPetIdResponseDto } from '../dto/find-hospitalizations-by-pet-id-response.dto';
import {
  HOSPITALIZATION_REPOSITORY,
  IHospitalizationRepository,
} from '../repositories/hospitalization.repository.interface';

interface AuthenticatedUser {
  id: string;
  rol: string;
}

@Injectable()
export class HospitalizationsService {
  constructor(
    @Inject(HOSPITALIZATION_REPOSITORY)
    private readonly hospitalizationRepository: IHospitalizationRepository,

    @Inject(PET_REPOSITORY)
    private readonly petRepository: IPetRepository,

    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    private readonly evolutionNotesService: EvolutionNotesService,
  ) {}

  private toHospitalizationDto(
    h: Hospitalization,
  ): CreateHospitalizationResponseDto {
    return {
      id: h.id,
      pet_id: h.pet_id,
      vet_id: h.vet_id,
      admission_date: h.admission_date,
      egress_date: h.egress_date ?? null,
      egress_status: h.egress_status ?? null,
      created_at: h.created_at,
      updated_at: h.updated_at,
    };
  }

  private toEvolutionNoteDto(
    n: EvolutionNote,
  ): FindHospitalizationByIdResponseDto['evolution_notes'][number] {
    return {
      id: n.id,
      hospitalization_id: n.hospitalization_id,
      vet_id: n.vet_id,
      note: n.note,
      created_at: n.created_at,
      updated_at: n.updated_at,
    };
  }

  async create(
    dto: CreateHospitalizationDto,
    user: AuthenticatedUser,
  ): Promise<CreateHospitalizationResponseDto> {
    const vet = await this.vetRepository.findByUserId(user.id);

    if (!vet) {
      throw new ForbiddenException(
        'Solo los veterinarios pueden crear hospitalizaciones',
      );
    }

    const active = await this.hospitalizationRepository.findActiveByPetId(
      dto.pet_id,
    );

    if (active) {
      throw new BadRequestException(
        'La mascota ya tiene una hospitalización activa',
      );
    }

    const created = await this.hospitalizationRepository.create(
      dto.pet_id,
      vet.id,
    );

    return this.toHospitalizationDto(created);
  }

  async findAll(
    role: string,
    userId: string,
  ): Promise<FindAllHospitalizationsResponseDto> {
    let hospitalizations: Hospitalization[];

    if (role === ROL_NOMBRES.CLIENTE) {
      const client = await this.clientRepository.findByUserId(userId);

      if (!client) {
        throw new ForbiddenException(
          'No se encontró cliente asociado al usuario',
        );
      }

      hospitalizations = await this.hospitalizationRepository.findByClientId(
        client.id,
      );
    } else {
      hospitalizations = await this.hospitalizationRepository.findAll();
    }

    return {
      data: hospitalizations.map((h) => this.toHospitalizationDto(h)),
    };
  }

  async findById(
    id: number,
    role: string,
    userId: string,
  ): Promise<FindHospitalizationByIdResponseDto> {
    const hospitalization =
      await this.hospitalizationRepository.findByIdWithPet(id);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    if (role === ROL_NOMBRES.CLIENTE) {
      const client = await this.clientRepository.findByUserId(userId);

      if (hospitalization.pet.client_id !== client?.id) {
        throw new ForbiddenException(
          'No tienes permiso para ver esta hospitalización',
        );
      }
    }

    const notes = await this.evolutionNotesService.findByHospitalizationId(id);

    return {
      id: hospitalization.id,
      pet_id: hospitalization.pet_id,
      vet_id: hospitalization.vet_id,
      admission_date: hospitalization.admission_date,
      egress_date: hospitalization.egress_date ?? null,
      egress_status: hospitalization.egress_status ?? null,
      created_at: hospitalization.created_at,
      updated_at: hospitalization.updated_at,
      evolution_notes: notes.map((n) => this.toEvolutionNoteDto(n)),
    };
  }

  async findByPetId(
    petId: number,
    role: string,
    userId: string,
  ): Promise<FindHospitalizationsByPetIdResponseDto> {
    if (role === ROL_NOMBRES.CLIENTE) {
      const pet = await this.petRepository.findById(petId);

      if (!pet) {
        throw new NotFoundException('La mascota ingresada no fue encontrada');
      }

      const client = await this.clientRepository.findByUserId(userId);

      if (pet.client.id !== client?.id) {
        throw new ForbiddenException(
          'No tienes permiso para ver las hospitalizaciones de esta mascota',
        );
      }
    }

    const hospitalizations =
      await this.hospitalizationRepository.findByPetId(petId);

    return {
      data: hospitalizations.map((h) => this.toHospitalizationDto(h)),
    };
  }

  async discharge(
    id: number,
    dto: DischargeHospitalizationDto,
  ): Promise<DischargeHospitalizationResponseDto> {
    const hospitalization = await this.hospitalizationRepository.findById(id);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    if (hospitalization.egress_date) {
      throw new BadRequestException('La hospitalización ya fue dada de alta');
    }

    const updated = await this.hospitalizationRepository.discharge({
      id,
      egress_status: dto.egress_status,
    });

    return this.toHospitalizationDto(
      updated,
    ) as DischargeHospitalizationResponseDto;
  }

  async delete(id: number): Promise<DeleteHospitalizationResponseDto> {
    const hospitalization = await this.hospitalizationRepository.findById(id);

    if (!hospitalization) {
      throw new NotFoundException(
        'La hospitalización ingresada no fue encontrada',
      );
    }

    await this.evolutionNotesService.softDeleteByHospitalizationId(id);
    await this.hospitalizationRepository.softDelete(id);

    return {
      id,
      message: 'La hospitalización fue eliminada correctamente',
      deleted_at: new Date(),
    };
  }
}
