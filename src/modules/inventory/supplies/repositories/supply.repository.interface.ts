import type {
  SupplyEntity,
  CreateSupplyInput,
  UpdateSupplyInput,
} from '../types/supply.types';

export const SUPPLY_REPOSITORY = 'SUPPLY_REPOSITORY';

export abstract class ISupplyRepository {
  abstract findAll(): Promise<SupplyEntity[]>;
  abstract findById(id: number): Promise<SupplyEntity | null>;
  abstract findLowStock(): Promise<SupplyEntity[]>;
  abstract findExpiringSoon(days: number): Promise<SupplyEntity[]>;
  abstract create(supply: CreateSupplyInput): Promise<SupplyEntity>;
  abstract update(supply: UpdateSupplyInput): Promise<SupplyEntity | null>;
  abstract delete(id: number): Promise<void>;
}
