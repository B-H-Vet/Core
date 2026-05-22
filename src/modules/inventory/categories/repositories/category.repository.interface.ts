import type {
  CategoryEntity,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types/category.types';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export abstract class ICategoryRepository {
  abstract findAll(): Promise<CategoryEntity[]>;

  abstract findById(id: number): Promise<CategoryEntity | null>;

  abstract create(category: CreateCategoryData): Promise<CategoryEntity>;

  abstract update(category: UpdateCategoryData): Promise<CategoryEntity | null>;

  abstract delete(id: number): Promise<void>;
}
