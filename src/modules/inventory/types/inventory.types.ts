export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface MeasurementUnit {
  id: number;
  unit: string;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface Supply {
  id: number;
  name: string;
  price: number;
  expiring_date?: Date | null;
  min_stock: number;
  stock: number;
  category: Category;
  measurement_unit: MeasurementUnit;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface SupplyRow {
  id: number;
  name: string;
  price: string;
  expiring_date: Date | null;
  min_stock: number;
  stock: number;
  id_category: number;
  id_measurement: number;
  created_at?: Date | null;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  id: number;
  name?: string;
  is_active?: boolean;
}

export interface CreateMeasurementUnitData {
  unit: string;
}

export interface UpdateMeasurementUnitData {
  id: number;
  unit?: string;
}

export interface CreateSupplyData {
  name: string;
  price: number;
  expiring_date?: Date | null;
  min_stock: number;
  stock: number;
  category: Category;
  measurement_unit: MeasurementUnit;
}

export interface UpdateSupplyData {
  id: number;
  name?: string;
  price?: number;
  expiring_date?: Date | null;
  min_stock?: number;
  stock?: number;
  category?: Category;
  measurement_unit?: MeasurementUnit;
}
