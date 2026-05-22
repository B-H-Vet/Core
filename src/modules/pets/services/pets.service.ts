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
import { CreatePetDto } from '../dto/create-pet.dto';
import { PetResponseDto } from '../dto/pet-response.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import {
  IPetRepository,
  PET_REPOSITORY,
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

  private toDto(pet: PetRow): PetResponseDto {
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

  async findAll(): Promise<PetResponseDto[]> {
    const pets = await this.petRepository.findAll();
    return pets.map((p) => this.toDto(p));
  }

  async findById(id: number): Promise<PetResponseDto> {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('La mascota ingresada no fue encontrada');
    }
    return this.toDto(pet);
  }

  async findByClientId(clientId: number): Promise<PetResponseDto[]> {
    const pets = await this.petRepository.findByClientId(clientId);
    return pets.map((p) => this.toDto(p));
  }

  async create(clientId: number, dto: CreatePetDto): Promise<PetResponseDto> {
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

    return this.toDto(pet);
  }

  async update(id: number, dto: UpdatePetDto): Promise<PetResponseDto> {
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
    return this.toDto(result);
  }

  async delete(id: number): Promise<string> {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('La mascota ingresada no fue encontrada');
    }
    await this.petRepository.delete(id);
    return 'La mascota fue eliminada correctamente';
  }
}
