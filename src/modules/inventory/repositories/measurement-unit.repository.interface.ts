import type {
  MeasurementUnit,
  CreateMeasurementUnitData,
  UpdateMeasurementUnitData,
} from '../types/inventory.types';

export const MEASUREMENT_UNIT_REPOSITORY = 'MEASUREMENT_UNIT_REPOSITORY';

export abstract class IMeasurementUnitRepository {
  abstract findAll(): Promise<MeasurementUnit[]>;

  abstract findById(id: number): Promise<MeasurementUnit | null>;

  abstract create(unit: CreateMeasurementUnitData): Promise<MeasurementUnit>;

  abstract update(
    unit: UpdateMeasurementUnitData,
  ): Promise<MeasurementUnit | null>;

  abstract delete(id: number): Promise<void>;
}
