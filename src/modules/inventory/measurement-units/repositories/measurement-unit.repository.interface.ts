import type {
  MeasurementUnitEntity,
  CreateMeasurementUnitData,
  UpdateMeasurementUnitData,
} from '../types/measurement-unit.types';

export const MEASUREMENT_UNIT_REPOSITORY = 'MEASUREMENT_UNIT_REPOSITORY';

export abstract class IMeasurementUnitRepository {
  abstract findAll(): Promise<MeasurementUnitEntity[]>;

  abstract findById(id: number): Promise<MeasurementUnitEntity | null>;

  abstract create(
    unit: CreateMeasurementUnitData,
  ): Promise<MeasurementUnitEntity>;

  abstract update(
    unit: UpdateMeasurementUnitData,
  ): Promise<MeasurementUnitEntity | null>;

  abstract delete(id: number): Promise<void>;
}
