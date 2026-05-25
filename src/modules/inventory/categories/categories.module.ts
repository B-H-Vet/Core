import { Module } from '@nestjs/common';

import { CategoriesController } from './controllers/categories.controller';
import { CategoryRepository } from './repositories/category.repository';
import { ICategoryRepository } from './repositories/category.repository.interface';
import { CategoriesService } from './services/categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: ICategoryRepository,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoriesService, ICategoryRepository],
})
export class CategoriesModule {}
