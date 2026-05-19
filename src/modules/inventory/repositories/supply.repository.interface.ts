import type {
  SupplyRow,
  CreateSupplyData,
  UpdateSupplyData,
} from '../types/inventory.types';

export const SUPPLY_REPOSITORY = 'SUPPLY_REPOSITORY';

export abstract class ISupplyRepository {
  abstract findAll(): Promise<SupplyRow[]>;
  abstract findById(id: number): Promise<SupplyRow | null>;
  abstract findLowStock(): Promise<SupplyRow[]>;
  abstract findExpiringSoon(days: number): Promise<SupplyRow[]>;
  abstract create(supply: CreateSupplyData): Promise<SupplyRow>;
  abstract update(supply: UpdateSupplyData): Promise<SupplyRow | null>;
  abstract delete(id: number): Promise<void>;
}
