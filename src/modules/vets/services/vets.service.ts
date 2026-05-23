import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  ISpecialtyRepository,
  SPECIALTY_REPOSITORY,
} from '../../specialties/repositories/specialty.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../users/repositories/user.repository.interface';
import { CreateVetDto } from '../dto/create-vet.dto';
import { UpdateVetDto } from '../dto/update-vet.dto';
import { VetResponseDto } from '../dto/vet-response.dto';
import {
  IVetRepository,
  VET_REPOSITORY,
  VetWithRelations,
  UpdateVetInput,
} from '../repositories/vet.repository.interface';

@Injectable()
export class VetsService {
  constructor(
    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(SPECIALTY_REPOSITORY)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  async findAll(): Promise<VetResponseDto[]> {
    const vets = await this.vetRepository.findAll();

    return vets.map((vet) => this.toDto(vet));
  }

  async findById(id: number): Promise<VetResponseDto> {
    const vet = await this.vetRepository.findById(id);

    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    return this.toDto(vet);
  }

  async create(userId: number, dto: CreateVetDto): Promise<VetResponseDto> {
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

    let specialty: { id: number; name?: string } | null = null;

    if (dto.specialtyId) {
      specialty = await this.specialtyRepository.findById(dto.specialtyId);

      if (!specialty) {
        throw new NotFoundException('La especialidad no fue encontrada');
      }
    }

    const vet = await this.vetRepository.create({
      user: {
        id: user.id,
      },
      license_number: dto.license_number,
      specialty,
    });

    return this.toDto(vet);
  }

  async update(id: number, dto: UpdateVetDto): Promise<VetResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const vet = await this.vetRepository.findById(id);

    if (!vet) {
      throw new NotFoundException('El veterinario no fue encontrado');
    }

    const updateInput: UpdateVetInput = {
      id: vet.id,
      license_number: dto.license_number ?? vet.license_number,
      is_active: dto.is_active ?? vet.is_active,
      specialty: vet.specialty,
    };

    if (dto.specialtyId) {
      const specialty = await this.specialtyRepository.findById(
        dto.specialtyId,
      );

      if (!specialty) {
        throw new NotFoundException('La especialidad no fue encontrada');
      }

      updateInput.specialty = specialty;
    }

    const updated = await this.vetRepository.update(updateInput);

    return this.toDto(updated);
  }

  private toDto(vet: VetWithRelations): VetResponseDto {
    return {
      id: vet.id,
      license_number: vet.license_number,
      specialty: vet.specialty
        ? {
            id: vet.specialty.id,
            name: vet.specialty.name,
          }
        : null,
      is_active: vet.is_active,
      created_at: vet.created_at,
      user: {
        id: vet.user.id,
        email: vet.user.email,
      },
    };
  }
}
