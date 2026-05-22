import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { type Service } from '../../../database/schema/services/services.schema';
import { CreateServiceDto } from '../dto/create-service.dto';
import { ServiceResponseDto } from '../dto/service-response.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '../repositories/service.repository.interface';

@Injectable()
export class ServicesService {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  private toDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description ?? null,
      price: service.price,
      is_active: service.is_active,
      created_at: service.created_at,
    };
  }

  async findAll(role?: string): Promise<ServiceResponseDto[]> {
    const all = await this.serviceRepository.findAll();
    if (role === 'CLIENTE') {
      return all.filter((s) => s.is_active).map((s) => this.toDto(s));
    }
    return all.map((s) => this.toDto(s));
  }

  async findById(id: number, role?: string): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }
    if (role === 'CLIENTE' && !service.is_active) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }
    return this.toDto(service);
  }

  async create(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      price: String(dto.price),
      is_active: true,
    });
    return this.toDto(service);
  }

  async update(id: number, dto: UpdateServiceDto): Promise<ServiceResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar el servicio',
      );
    }
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }

    const updated = await this.serviceRepository.update({
      id,
      name: dto.name ?? service.name,
      description: dto.description ?? service.description,
      price: dto.price !== undefined ? String(dto.price) : service.price,
      is_active: dto.is_active ?? service.is_active,
    });
    return this.toDto(updated);
  }

  async delete(id: number): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }
    await this.serviceRepository.delete(id);
    return this.toDto({ ...service, deleted_at: new Date() });
  }
}
