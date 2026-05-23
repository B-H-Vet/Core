import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../users/user/repositories/user.repository.interface';
import { CreateClientResponseDto } from '../dto/create-client-response.dto';
import { FindAllClientsResponseDto } from '../dto/find-all-clients-response.dto';
import { FindClientByIdResponseDto } from '../dto/find-client-by-id-response.dto';
import { FindClientByUserIdResponseDto } from '../dto/find-client-by-user-id-response.dto';
import { UpdateClientResponseDto } from '../dto/update-client-response.dto';
import {
  IClientRepository,
  CLIENT_REPOSITORY,
} from '../repositories/client.repository.interface';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findAll(): Promise<FindAllClientsResponseDto[]> {
    const clients = await this.clientRepository.findAll();
    return clients.map((client) => ({
      id: client.id,
      phone: client.phone,
      address: client.address,
      is_active: client.is_active,
      created_at: client.created_at,
      user: {
        id: client.user.id,
        email: client.user.email,
      },
    }));
  }

  async findById(id: number): Promise<FindClientByIdResponseDto> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    return {
      id: client.id,
      phone: client.phone,
      address: client.address,
      is_active: client.is_active,
      created_at: client.created_at,
      user: {
        id: client.user.id,
        email: client.user.email,
      },
    };
  }

  async findByUserId(userId: number): Promise<FindClientByUserIdResponseDto> {
    const client = await this.clientRepository.findByUserId(userId);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    return {
      id: client.id,
      phone: client.phone,
      address: client.address,
      is_active: client.is_active,
      created_at: client.created_at,
      user: {
        id: client.user.id,
        email: client.user.email,
      },
    };
  }

  async create(
    userId: number,
    phone: string,
    address?: string,
  ): Promise<CreateClientResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('El usuario no fue encontrado');
    }

    const existingClient = await this.clientRepository.findByUserId(userId);

    if (existingClient) {
      throw new BadRequestException(
        'Este usuario ya tiene un perfil de cliente',
      );
    }

    const client = await this.clientRepository.create({
      user: { id: user.id },
      phone,
      ...(address ? { address } : {}),
    });

    return {
      id: client.id,
      phone: client.phone,
      address: client.address,
      is_active: client.is_active,
      created_at: client.created_at,
      user: {
        id: client.user.id,
        email: client.user.email,
      },
    };
  }

  async update(
    id: number,
    dto: { phone?: string; address?: string },
  ): Promise<UpdateClientResponseDto> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    const updatedClient = await this.clientRepository.update({
      ...client,
      phone: dto.phone ?? client.phone,
      address: dto.address ?? client.address,
    });

    return {
      id: updatedClient.id,
      phone: updatedClient.phone,
      address: updatedClient.address,
      is_active: updatedClient.is_active,
      created_at: updatedClient.created_at,
      user: {
        id: updatedClient.user.id,
        email: updatedClient.user.email,
      },
    };
  }

  async delete(id: number): Promise<string> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    await this.clientRepository.delete(id);

    return 'El cliente fue eliminado correctamente';
  }

  async desactivar(id: number): Promise<string> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    if (!client.is_active) {
      throw new BadRequestException('El cliente ya está desactivado');
    }

    await this.clientRepository.update({
      ...client,
      is_active: false,
    });

    return 'Cliente desactivado correctamente';
  }

  async activar(id: number): Promise<string> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    if (client.is_active) {
      throw new BadRequestException('El cliente ya está activo');
    }

    await this.clientRepository.update({
      ...client,
      is_active: true,
    });

    return 'El cliente ha sido activado correctamente';
  }
}
