import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateSpecialtyResponseDto } from '../dto/create-specialty-response.dto';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';
import { DeleteSpecialtyResponseDto } from '../dto/delete-specialty-response.dto';
import { DesactivarSpecialtyResponseDto } from '../dto/desactivar-specialty-response.dto';
import { FindAllSpecialtiesResponseDto } from '../dto/find-all-specialties-response.dto';
import { FindSpecialtyByIdResponseDto } from '../dto/find-specialty-by-id-response.dto';
import { UpdateSpecialtyResponseDto } from '../dto/update-specialty-response.dto';
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

  async findAll(): Promise<FindAllSpecialtiesResponseDto[]> {
    const all = await this.specialtyRepository.findAll();
    return all.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
      description: specialty.description ?? null,
      is_active: specialty.is_active,
      created_at: specialty.created_at,
    }));
  }

  async findById(id: number): Promise<FindSpecialtyByIdResponseDto> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(
        'La especialidad ingresada no fue encontrada',
      );
    }
    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description ?? null,
      is_active: specialty.is_active,
      created_at: specialty.created_at,
    };
  }

  async create(dto: CreateSpecialtyDto): Promise<CreateSpecialtyResponseDto> {
    try {
      const specialty = await this.specialtyRepository.create({
        name: dto.name,
        description: dto.description ?? null,
      });
      return {
        id: specialty.id,
        name: specialty.name,
        description: specialty.description ?? null,
        is_active: specialty.is_active,
        created_at: specialty.created_at,
      };
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
  ): Promise<UpdateSpecialtyResponseDto> {
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
      return {
        id: updated.id,
        name: updated.name,
        description: updated.description ?? null,
        is_active: updated.is_active,
        created_at: updated.created_at,
      };
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

  async desactivar(id: number): Promise<DesactivarSpecialtyResponseDto> {
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
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description ?? null,
      is_active: updated.is_active,
      created_at: updated.created_at,
    };
  }

  async delete(id: number): Promise<DeleteSpecialtyResponseDto> {
    const specialty = await this.specialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException(
        'La especialidad ingresada no fue encontrada',
      );
    }
    await this.specialtyRepository.delete(id);
    return {
      id: specialty.id,
      name: specialty.name,
      description: specialty.description ?? null,
      is_active: specialty.is_active,
      created_at: specialty.created_at,
    };
  }
}
