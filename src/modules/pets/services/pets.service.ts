import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  IClientRepository,
  CLIENT_REPOSITORY,
} from '../../clients/repositories/client.repository.interface';
import { CreatePetResponseDto } from '../dto/create-pet-response.dto';
import { CreatePetDto } from '../dto/create-pet.dto';
import { DeletePetResponseDto } from '../dto/delete-pet-response.dto';
import { FindPetByIdResponseDto } from '../dto/find-pet-by-id-response.dto';
import { PetListResponseDto } from '../dto/pet-list-response.dto';
import { PetResponseDto } from '../dto/pet-response.dto';
import { UpdatePetResponseDto } from '../dto/update-pet-response.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import {
  IPetRepository,
  PET_REPOSITORY,
  PaginationParams,
  PetRow,
} from '../repositories/pet.repository.interface';

@Injectable()
export class PetsService {
  constructor(
    @Inject(PET_REPOSITORY)
    private readonly petRepository: IPetRepository,

    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  private toPetResponseDto(pet: PetRow): PetResponseDto {
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      birth_date: pet.birth_date,
      weight: pet.weight,
      status: pet.status,
      created_at: pet.created_at,
      client: {
        id: pet.client.id,
      },
    };
  }

  async findAll(pagination: PaginationParams): Promise<PetListResponseDto> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const [pets, total] = await Promise.all([
      this.petRepository.findAll({ page, limit }),
      this.petRepository.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: pets.map((p) => this.toPetResponseDto(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: number): Promise<FindPetByIdResponseDto> {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('La mascota ingresada no fue encontrada');
    }

    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      birth_date: pet.birth_date,
      weight: pet.weight,
      status: pet.status,
      created_at: pet.created_at,
      client: {
        id: pet.client.id,
      },
    };
  }

  async findByClientId(
    clientId: number,
    pagination: PaginationParams,
  ): Promise<PetListResponseDto> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const [pets, total] = await Promise.all([
      this.petRepository.findByClientId(clientId, { page, limit }),
      this.petRepository.countByClientId(clientId),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: pets.map((p) => this.toPetResponseDto(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async create(
    clientId: number,
    dto: CreatePetDto,
  ): Promise<CreatePetResponseDto> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    const pet = await this.petRepository.create({
      client: { id: client.id },
      name: dto.name,
      species: dto.species,
      breed: dto.breed ?? null,
      color: dto.color ?? null,
      birth_date: dto.birth_date ?? null,
      weight: dto.weight ?? null,
    });

    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      birth_date: pet.birth_date,
      weight: pet.weight,
      status: pet.status,
      client: {
        id: pet.client.id,
      },
    };
  }

  async update(id: number, dto: UpdatePetDto): Promise<UpdatePetResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('La mascota ingresada no fue encontrada');
    }

    const updatedPet: PetRow = {
      ...pet,
      name: dto.name ?? pet.name,
      species: dto.species ?? pet.species,
      breed: dto.breed ?? pet.breed,
      color: dto.color ?? pet.color,
      birth_date: dto.birth_date ?? pet.birth_date,
      weight: dto.weight?.toString() ?? pet.weight,
      status: dto.status ?? pet.status,
    };

    const result = await this.petRepository.update(updatedPet);

    return {
      id: result.id,
      name: result.name,
      species: result.species,
      breed: result.breed,
      color: result.color,
      birth_date: result.birth_date,
      weight: result.weight,
      status: result.status,
      updated_at: result.updated_at,
    };
  }

  async delete(id: number): Promise<DeletePetResponseDto> {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('La mascota ingresada no fue encontrada');
    }

    await this.petRepository.delete(id);

    return {
      id: pet.id,
      message: 'La mascota fue eliminada correctamente',
      deleted_at: new Date(),
    };
  }
}
