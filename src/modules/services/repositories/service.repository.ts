/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import {
  services,
  type Service,
} from '../../../database/schema/services/services.schema';

import { IServiceRepository } from './service.repository.interface';

@Injectable()
export class ServiceRepository extends IServiceRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {
    super();
  }

  async findAll(): Promise<Service[]> {
    return this.db
      .select()
      .from(services)
      .where(isNull(services.deleted_at)) as Promise<Service[]>;
  }

  async findById(id: number): Promise<Service | null> {
    const result = (await this.db
      .select()
      .from(services)
      .where(and(eq(services.id, id), isNull(services.deleted_at)))
      .limit(1)) as Service[];
    return result[0] ?? null;
  }

  async create(service: Partial<Service>): Promise<Service> {
    if (!service.name || !service.price) {
      throw new Error('Name and price are required');
    }

    await this.db.insert(services).values({
      name: service.name,
      description: service.description ?? null,
      price: service.price,
      is_active: service.is_active ?? true,
    });
    const result = (await this.db
      .select()
      .from(services)
      .where(eq(services.name, service.name))
      .limit(1)) as Service[];
    if (!result[0]) {
      throw new Error('Error al crear el servicio');
    }
    return result[0];
  }

  async update(service: Partial<Service> & { id: number }): Promise<Service> {
    await this.db
      .update(services)
      .set({
        name: service.name,
        description: service.description,
        price: service.price,
        is_active: service.is_active,
        updated_at: new Date(),
      })
      .where(eq(services.id, service.id));
    const updated = await this.findById(service.id);
    if (!updated) {
      throw new Error('Error al actualizar el servicio');
    }
    return updated;
  }
  async delete(id: number): Promise<void> {
    await this.db
      .update(services)
      .set({ deleted_at: new Date() })
      .where(eq(services.id, id));
  }
}
