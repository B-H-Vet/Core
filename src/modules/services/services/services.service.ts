import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { type Service } from '../../../database/schema/services/services.schema';
import { CreateServiceResponseDto } from '../dto/create-service-response.dto';
import { CreateServiceDto } from '../dto/create-service.dto';
import { DeleteServiceResponseDto } from '../dto/delete-service-response.dto';
import { GetAllServiceResponseDto } from '../dto/get-all-service-response.dto';
import { GetServiceResponseDto } from '../dto/get-service-response.dto';
import { UpdateServiceResponseDto } from '../dto/update-service-response.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '../repositories/service.repository.interface';

import { ServicesAuditService } from './services-audit.service';

@Injectable()
export class ServicesService {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    private readonly auditService: ServicesAuditService,
  ) {}

  private toDto(service: Service): GetAllServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description ?? null,
      price: service.price,
      is_active: service.is_active,
      created_at: service.created_at,
    };
  }

  private toDeleteDto(service: Service): DeleteServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description ?? null,
      price: service.price,
      is_active: service.is_active,
      deleted_at: service.deleted_at ?? new Date(),
    };
  }

  async findAll(role?: string): Promise<GetAllServiceResponseDto[]> {
    const all = await this.serviceRepository.findAll();
    if (role === 'CLIENTE') {
      return all.filter((s) => s.is_active).map((s) => this.toDto(s));
    }
    return all.map((s) => this.toDto(s));
  }

  async findById(id: number, role?: string): Promise<GetServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }
    if (role === 'CLIENTE' && !service.is_active) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }
    return this.toDto(service);
  }

  async create(
    dto: CreateServiceDto,
    userId: string,
    userRole: string,
  ): Promise<CreateServiceResponseDto> {
    const service = await this.serviceRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      price: String(dto.price),
      is_active: true,
    });

    await this.auditService.serviceCreated({
      serviceId: String(service.id),
      price: parseFloat(service.price),
      serviceCreatorId: userId,
      serviceCreatorRole: userRole,
    });

    return this.toDto(service);
  }

  async update(
    id: number,
    dto: UpdateServiceDto,
    userId: string,
    userRole: string,
  ): Promise<UpdateServiceResponseDto> {
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

    await this.auditService.serviceEdited({
      serviceId: String(updated.id),
      serviceEditorId: userId,
      serviceEditorRole: userRole,
    });

    return this.toDto(updated);
  }

  async delete(
    id: number,
    userId: string,
    userRole: string,
  ): Promise<DeleteServiceResponseDto> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException('El servicio ingresado no fue encontrado');
    }
    await this.serviceRepository.delete(id);

    await this.auditService.serviceDeactivated({
      serviceId: String(id),
      serviceDeactivatorId: userId,
      serviceDeactivatorRole: userRole,
    });

    return this.toDeleteDto({ ...service, deleted_at: new Date() });
  }
}
