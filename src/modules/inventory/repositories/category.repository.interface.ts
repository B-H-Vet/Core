import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types/inventory.types';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export abstract class ICategoryRepository {
  abstract findAll(): Promise<Category[]>;

  abstract findById(id: number): Promise<Category | null>;

  abstract create(category: CreateCategoryData): Promise<Category>;

  abstract update(category: UpdateCategoryData): Promise<Category | null>;

  abstract delete(id: number): Promise<void>;
}
