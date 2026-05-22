import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { FindAllCategoriesResponseDto } from '../dto/find-all-categories-response.dto';
import { FindCategoryByIdResponseDto } from '../dto/find-category-by-id-response.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ICategoryRepository } from '../repositories/category.repository.interface';
import { CreateCategoryData } from '../types/category.types';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async findAll(): Promise<FindAllCategoriesResponseDto[]> {
    const entities = await this.categoryRepository.findAll();
    return entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      is_active: entity.is_active,
    }));
  }

  async findById(id: number): Promise<FindCategoryByIdResponseDto> {
    const entity = await this.categoryRepository.findById(id);

    if (!entity) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    return {
      id: entity.id,
      name: entity.name,
      is_active: entity.is_active,
    };
  }

  async create(dto: CreateCategoryDto): Promise<FindCategoryByIdResponseDto> {
    const categoryData: CreateCategoryData = {
      name: dto.name,
    };

    const entity = await this.categoryRepository.create(categoryData);
    return {
      id: entity.id,
      name: entity.name,
      is_active: entity.is_active,
    };
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<FindCategoryByIdResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const entity = await this.categoryRepository.findById(id);

    if (!entity) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    if (dto.name) entity.name = dto.name;
    if (dto.is_active !== undefined) entity.is_active = dto.is_active;

    const updated = await this.categoryRepository.update(entity);

    if (!updated) {
      throw new NotFoundException(
        'La categoría no fue encontrada al actualizar',
      );
    }

    return {
      id: updated.id,
      name: updated.name,
      is_active: updated.is_active,
    };
  }

  async desactivar(id: number): Promise<string> {
    const entity = await this.categoryRepository.findById(id);

    if (!entity) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    if (!entity.is_active) {
      throw new BadRequestException('La categoría ya está desactivada');
    }

    entity.is_active = false;

    await this.categoryRepository.update(entity);

    return 'La categoría fue desactivada correctamente';
  }
}
