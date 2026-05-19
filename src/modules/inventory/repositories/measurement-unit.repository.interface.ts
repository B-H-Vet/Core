export const MEASUREMENT_UNIT_REPOSITORY = 'MEASUREMENT_UNIT_REPOSITORY';

export abstract class IMeasurementUnitRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract create(unit: any): Promise<any>;
  abstract update(unit: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}