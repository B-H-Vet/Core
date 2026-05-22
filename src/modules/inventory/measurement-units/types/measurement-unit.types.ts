export interface MeasurementUnitEntity {
  id: number;
  unit: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateMeasurementUnitData {
  unit: string;
}

export interface UpdateMeasurementUnitData {
  id: number;
  unit?: string;
}
