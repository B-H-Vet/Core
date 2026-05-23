import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  ISpecialtyRepository,
  SPECIALTY_REPOSITORY,
} from '../../specialties/repositories/specialty.repository.interface';
import {
  IVetRepository,
  VET_REPOSITORY,
} from '../../vet/repositories/vet.repository.interface';
import { AssignVetSpecialtiesResponseDto } from '../dto/assign-vet-specialties-response.dto';
import { RemoveVetSpecialtyResponseDto } from '../dto/remove-vet-specialty-response.dto';
import {
  IVetSpecialtiesRepository,
  VET_SPECIALTIES_REPOSITORY,
} from '../repositories/vet-specialties.repository.interface';

@Injectable()
export class VetSpecialtiesService {
  constructor(
    @Inject(VET_SPECIALTIES_REPOSITORY)
    private readonly vetSpecialtiesRepository: IVetSpecialtiesRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    @Inject(SPECIALTY_REPOSITORY)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async assignSpecialties(
    vetId: number,
    specialtyIds: number[],
  ): Promise<AssignVetSpecialtiesResponseDto> {
    const vet = await this.vetRepository.findById(vetId);
    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    for (const specialtyId of specialtyIds) {
      const specialty = await this.specialtyRepository.findById(specialtyId);
      if (!specialty) {
        throw new NotFoundException(
          `La especialidad con id ${String(specialtyId)} no fue encontrada`,
        );
      }
    }

    await this.vetSpecialtiesRepository.createMany(
      specialtyIds.map((specialtyId) => ({
        vet_id: vetId,
        specialty_id: specialtyId,
      })),
    );

    return {
      message: 'Especialidades asignadas correctamente',
      vetId,
      assignedSpecialtyIds: specialtyIds,
    };
  }

  async syncSpecialties(vetId: number, specialtyIds: number[]): Promise<void> {
    const vet = await this.vetRepository.findById(vetId);
    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    for (const specialtyId of specialtyIds) {
      const specialty = await this.specialtyRepository.findById(specialtyId);
      if (!specialty) {
        throw new NotFoundException(
          `La especialidad con id ${String(specialtyId)} no fue encontrada`,
        );
      }
    }

    await this.vetSpecialtiesRepository.deleteByVetId(vetId);

    if (specialtyIds.length > 0) {
      await this.vetSpecialtiesRepository.createMany(
        specialtyIds.map((specialtyId) => ({
          vet_id: vetId,
          specialty_id: specialtyId,
        })),
      );
    }
  }

  async removeSpecialty(
    vetId: number,
    specialtyId: number,
  ): Promise<RemoveVetSpecialtyResponseDto> {
    const vet = await this.vetRepository.findById(vetId);
    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    await this.vetSpecialtiesRepository.deleteByVetIdAndSpecialtyIds(vetId, [
      specialtyId,
    ]);

    return {
      message: 'Especialidad removida correctamente',
      vetId,
      removedSpecialtyId: specialtyId,
    };
  }
}
