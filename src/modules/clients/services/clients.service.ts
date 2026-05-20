import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../users/repositories/user.repository.interface';
import { ClientResponseDto } from '../dto/client-response.dto';
import {
  IClientRepository,
  CLIENT_REPOSITORY,
  ClientWithUser,
} from '../repositories/client.repository.interface';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  private toDto(client: ClientWithUser): ClientResponseDto {
    return {
      id: client.id,
      phone: client.phone,
      address: client.address ?? '',
      is_active: client.is_active,
      created_at: client.created_at,
      user: {
        id: client.user.id,
        email: client.user.email,
      },
    };
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientRepository.findAll();
    return clients.map((client) => this.toDto(client));
  }

  async findById(id: number): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    return this.toDto(client);
  }

  async findByUserId(userId: number): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findByUserId(userId);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    return this.toDto(client);
  }

  async create(
    userId: number,
    phone: string,
    address?: string,
  ): Promise<ClientResponseDto> {
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

    return this.toDto(client);
  }

  async update(
    id: number,
    dto: { phone?: string; address?: string },
  ): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new NotFoundException('El cliente ingresado no fue encontrado');
    }

    const updatedClient = await this.clientRepository.update({
      ...client,
      phone: dto.phone ?? client.phone,
      address: dto.address ?? client.address,
    });

    return this.toDto(updatedClient);
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
