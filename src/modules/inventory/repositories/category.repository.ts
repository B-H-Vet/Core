import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { categories } from '../../../database/schema/inventory/categories.schema';
import { ICategoryRepository } from './category.repository.interface';

@Injectable()
export class CategoryRepository extends ICategoryRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: any,
  ) {
    super();
  }

  async findAll(): Promise<any[]> {
    return this.db
      .select()
      .from(categories)
      .where(isNull(categories.deleted_at));
  }

  async findById(id: number): Promise<any | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(category: any): Promise<any> {
    await this.db.insert(categories).values({ name: category.name });
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.name, category.name))
      .limit(1);
    return result[0];
  }

  async update(category: any): Promise<any> {
    await this.db
      .update(categories)
      .set({
        name: category.name,
        is_active: category.is_active,
        updated_at: new Date(),
      })
      .where(eq(categories.id, category.id));
    return this.findById(category.id);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .update(categories)
      .set({ deleted_at: new Date() })
      .where(eq(categories.id, id));
  }
}