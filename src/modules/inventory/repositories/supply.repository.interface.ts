export const SUPPLY_REPOSITORY = 'SUPPLY_REPOSITORY';

export abstract class ISupplyRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract findLowStock(): Promise<any[]>;
  abstract findExpiringSoon(days: number): Promise<any[]>;
  abstract create(supply: any): Promise<any>;
  abstract update(supply: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}