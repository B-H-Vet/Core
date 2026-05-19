import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

import { DATABASE_CONNECTION } from '../../../database/database.module';
import * as schema from '../../../database/schema';
import { categories } from '../../../database/schema/inventory/categories.schema';
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types/inventory.types';

import { ICategoryRepository } from './category.repository.interface';

@Injectable()
export class CategoryRepository extends ICategoryRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: MySql2Database<typeof schema>,
  ) {
    super();
  }

  findAll(): Promise<Category[]> {
    return this.db
      .select()
      .from(categories)
      .where(isNull(categories.deleted_at));
  }

  async findById(id: number): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return (result[0] as Category | undefined) ?? null;
  }

  async create(category: CreateCategoryData): Promise<Category> {
    await this.db.insert(categories).values({
      name: category.name,
    });

    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.name, category.name))
      .limit(1);

    return result[0] as Category;
  }

  async update(category: UpdateCategoryData): Promise<Category | null> {
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
      .set({
        deleted_at: new Date(),
      })
      .where(eq(categories.id, id));
  }
}
