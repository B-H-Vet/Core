import type { CategoryEntity } from '../../categories/types/category.types';
import type { MeasurementUnitEntity } from '../../measurement-units/types/measurement-unit.types';

export interface SupplyEntity {
  id: number;
  name: string;
  price: string;
  expiring_date: Date | null;
  min_stock: number;
  stock: number;
  id_category: number;
  id_measurement: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface SupplyWithRelations {
  id: number;
  name: string;
  price: number;
  expiring_date: Date | null;
  min_stock: number;
  stock: number;
  category: CategoryEntity;
  measurement_unit: MeasurementUnitEntity;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateSupplyInput {
  name: string;
  price: number;
  expiring_date: Date | null;
  min_stock: number;
  stock: number;
  id_category: number;
  id_measurement: number;
}

export interface UpdateSupplyInput {
  id: number;
  name?: string;
  price?: string;
  expiring_date?: Date | null;
  min_stock?: number;
  stock?: number;
  id_category?: number;
  id_measurement?: number;
}
