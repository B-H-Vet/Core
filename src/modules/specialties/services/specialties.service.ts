import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { type Specialty } from '../../../database/schema/specialties/specialties.schema';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { SpecialtyResponseDto } from '../dto/specialty-response.dto';
import { UpdateSpecialtyDto } from '../dto/update-specialty.dto';
import {
  ISpecialtyRepository,
  SPECIALTY_REPOSITORY,
} from '../repositories/specialty.repository.interface';

@Injectable()
export class SpecialtiesService {
  constructor(
    @Inject(SPECIALTY_REPOSITORY)
    private readonly specialtyRepository: ISpecialtyRepository,
  ) {}

  private toDto(specialty: Specialty): SpecialtyResponseDto {
    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description ?? null,
      is_active: specialty.is_active,
      created_at: specialty.created_at,
    };
  }

  async findAll(): Promise<SpecialtyResponseDto[]> {
    const all = await this.specialtyRepository.findAll();
    return all.map((s) => this.toDto(s));
  }

  async findById(id: number): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(
        'La especialidad ingresada no fue encontrada',
      );
    }
    return this.toDto(specialty);
  }

  async create(dto: CreateSpecialtyDto): Promise<SpecialtyResponseDto> {
    try {
      const specialty = await this.specialtyRepository.create({
        name: dto.name,
        description: dto.description ?? null,
      });
      return this.toDto(specialty);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('El nombre de la especialidad ya existe');
      }
      throw e;
    }
  }

  async update(
    id: number,
    dto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(
        'La especialidad ingresada no fue encontrada',
      );
    }
    try {
      const updated = await this.specialtyRepository.update({
        id,
        name: dto.name ?? specialty.name,
        description: dto.description ?? specialty.description,
        is_active: dto.is_active ?? specialty.is_active,
      });
      return this.toDto(updated);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('El nombre de la especialidad ya existe');
      }
      throw e;
    }
  }

  async desactivar(id: number): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(
        'La especialidad ingresada no fue encontrada',
      );
    }
    if (!specialty.is_active) {
      throw new BadRequestException('La especialidad ya está desactivada');
    }
    const updated = await this.specialtyRepository.update({
      id,
      is_active: false,
    });
    return this.toDto(updated);
  }

  async delete(id: number): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(
        'La especialidad ingresada no fue encontrada',
      );
    }
    await this.specialtyRepository.delete(id);
    return this.toDto({ ...specialty, deleted_at: new Date() });
  }
}
