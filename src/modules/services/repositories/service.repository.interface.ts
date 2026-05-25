import { type Service } from '../../../database/schema/services/services.schema';

export const SERVICE_REPOSITORY = 'SERVICE_REPOSITORY';

export abstract class IServiceRepository {
  abstract findAll(): Promise<Service[]>;
  abstract findById(id: number): Promise<Service | null>;
  abstract create(service: Partial<Service>): Promise<Service>;
  abstract findManyByIds(ids: number[]): Promise<Service[]>;
  abstract update(service: Partial<Service> & { id: number }): Promise<Service>;
  abstract delete(id: number): Promise<void>;
}
