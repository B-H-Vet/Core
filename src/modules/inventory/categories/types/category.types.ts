export interface CategoryEntity {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  id: number;
  name?: string;
  is_active?: boolean;
}
