export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export abstract class ICategoryRepository {
  abstract findAll(): Promise<any[]>;
  abstract findById(id: number): Promise<any | null>;
  abstract create(category: any): Promise<any>;
  abstract update(category: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}