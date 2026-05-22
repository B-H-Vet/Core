import { Module } from '@nestjs/common';

import { CategoriesController } from './controllers/categories.controller';
import { CategoryRepository } from './repositories/category.repository';
import { CATEGORY_REPOSITORY } from './repositories/category.repository.interface';
import { CategoriesService } from './services/categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
  ],
  exports: [CategoriesService, CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
