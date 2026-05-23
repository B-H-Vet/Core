import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../users/user/repositories/user.repository.interface';
import {
  IVetSpecialtiesRepository,
  VET_SPECIALTIES_REPOSITORY,
} from '../../vet-specialties/repositories/vet-specialties.repository.interface';
import { CreateVetResponseDto } from '../dto/create-vet-response.dto';
import { FindAllVetsResponseDto } from '../dto/find-all-vets-response.dto';
import { FindVetByIdResponseDto } from '../dto/find-vet-by-id-response.dto';
import { UpdateVetResponseDto } from '../dto/update-vet-response.dto';
import { UpdateVetDto } from '../dto/update-vet.dto';
import {
  IVetRepository,
  VET_REPOSITORY,
  VetWithRelations,
  PaginationParams,
} from '../repositories/vet.repository.interface';

@Injectable()
export class VetService {
  constructor(
    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(VET_SPECIALTIES_REPOSITORY)
    private readonly vetSpecialtiesRepository: IVetSpecialtiesRepository,
  ) {}

  async findAll(
    pagination?: PaginationParams,
  ): Promise<FindAllVetsResponseDto> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;

    const vets = await this.vetRepository.findAll({ page, limit });
    const total = await this.vetRepository.count();
    const totalPages = Math.ceil(total / limit);

    return {
      data: vets.map((vet) => this.toDto(vet)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: number): Promise<FindVetByIdResponseDto> {
    const vet = await this.vetRepository.findById(id);

    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    return this.toDto(vet);
  }

  async create(
    userId: number,
    dto: { license_number: string; specialtyIds?: number[] },
  ): Promise<CreateVetResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('El usuario no fue encontrado');
    }

    const vetExistente = await this.vetRepository.findByUserId(userId);

    if (vetExistente) {
      throw new BadRequestException(
        'Este usuario ya tiene un perfil de veterinario',
      );
    }

    const vet = await this.vetRepository.create({
      user: {
        id: user.id,
      },
      license_number: dto.license_number,
    });

    if (dto.specialtyIds && dto.specialtyIds.length > 0) {
      await this.vetSpecialtiesRepository.createMany(
        dto.specialtyIds.map((specialtyId) => ({
          vet_id: vet.id,
          specialty_id: specialtyId,
        })),
      );
    }

    const createdVet = await this.vetRepository.findById(vet.id);
    if (!createdVet) {
      throw new NotFoundException('Error al crear el veterinario');
    }
    return this.toDto(createdVet);
  }

  async update(id: number, dto: UpdateVetDto): Promise<UpdateVetResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const vet = await this.vetRepository.findById(id);

    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    const updated = await this.vetRepository.update({
      id: vet.id,
      license_number: dto.license_number ?? vet.license_number,
      is_active: dto.is_active ?? vet.is_active,
    });

    if (dto.specialtyIds !== undefined) {
      await this.vetSpecialtiesRepository.deleteByVetId(id);

      if (dto.specialtyIds.length > 0) {
        await this.vetSpecialtiesRepository.createMany(
          dto.specialtyIds.map((specialtyId) => ({
            vet_id: id,
            specialty_id: specialtyId,
          })),
        );
      }
    }

    const updatedVet = await this.vetRepository.findById(updated.id);
    if (!updatedVet) {
      throw new NotFoundException('Error al actualizar el veterinario');
    }
    return this.toDto(updatedVet);
  }

  private toDto(vet: VetWithRelations) {
    return {
      id: vet.id,
      license_number: vet.license_number,
      is_active: vet.is_active,
      created_at: vet.created_at,
      user: {
        id: vet.user.id,
        email: vet.user.email,
      },
      specialties: vet.specialties.map((s) => ({
        id: s.id,
        name: s.name,
      })),
    };
  }
}
