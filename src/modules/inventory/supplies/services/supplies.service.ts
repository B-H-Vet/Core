import { Injectable } from '@nestjs/common';

import {
  BadRequestBusinessException,
  NotFoundBusinessException,
} from '../../../../common/exceptions';
import { CategoriesService } from '../../categories/services/categories.service';
import { MeasurementUnitsService } from '../../measurement-units/services/measurement-units.service';
import { CreateSupplyDto } from '../dto/create-supply.dto';
import { FindAllSuppliesResponseDto } from '../dto/find-all-supplies-response.dto';
import { FindExpiringSoonSuppliesResponseDto } from '../dto/find-expiring-soon-supplies-response.dto';
import { FindLowStockSuppliesResponseDto } from '../dto/find-low-stock-supplies-response.dto';
import { FindSupplyByIdResponseDto } from '../dto/find-supply-by-id-response.dto';
import { UpdateSupplyDto } from '../dto/update-supply.dto';
import { ISupplyRepository } from '../repositories/supply.repository.interface';
import { CreateSupplyInput } from '../types/supply.types';

@Injectable()
export class SuppliesService {
  constructor(
    private readonly supplyRepository: ISupplyRepository,
    private readonly categoriesService: CategoriesService,
    private readonly measurementUnitsService: MeasurementUnitsService,
  ) {}

  async findAll(): Promise<FindAllSuppliesResponseDto[]> {
    const entities = await this.supplyRepository.findAll();
    return Promise.all(
      entities.map(async (entity) => {
        const category = await this.categoriesService.findById(
          entity.id_category,
        );
        const measurementUnit = await this.measurementUnitsService.findById(
          entity.id_measurement,
        );

        return {
          id: entity.id,
          name: entity.name,
          price: parseFloat(entity.price),
          expiring_date: entity.expiring_date,
          min_stock: entity.min_stock,
          stock: entity.stock,
          category,
          measurement_unit: measurementUnit,
        };
      }),
    );
  }

  async findById(id: number): Promise<FindSupplyByIdResponseDto> {
    const entity = await this.supplyRepository.findById(id);

    if (!entity) {
      throw new NotFoundBusinessException(
        'SUPPLY_NOT_FOUND',
        'El producto no fue encontrado',
        { supply_id: id },
      );
    }

    const category = await this.categoriesService.findById(entity.id_category);
    const measurementUnit = await this.measurementUnitsService.findById(
      entity.id_measurement,
    );

    return {
      id: entity.id,
      name: entity.name,
      price: parseFloat(entity.price),
      expiring_date: entity.expiring_date,
      min_stock: entity.min_stock,
      stock: entity.stock,
      category,
      measurement_unit: measurementUnit,
    };
  }

  async findLowStock(): Promise<FindLowStockSuppliesResponseDto[]> {
    const entities = await this.supplyRepository.findLowStock();
    return Promise.all(
      entities.map(async (entity) => {
        const category = await this.categoriesService.findById(
          entity.id_category,
        );
        const measurementUnit = await this.measurementUnitsService.findById(
          entity.id_measurement,
        );

        return {
          id: entity.id,
          name: entity.name,
          price: parseFloat(entity.price),
          expiring_date: entity.expiring_date,
          min_stock: entity.min_stock,
          stock: entity.stock,
          category,
          measurement_unit: measurementUnit,
        };
      }),
    );
  }

  async findExpiringSoon(
    days = 30,
  ): Promise<FindExpiringSoonSuppliesResponseDto[]> {
    const entities = await this.supplyRepository.findExpiringSoon(days);
    return Promise.all(
      entities.map(async (entity) => {
        const category = await this.categoriesService.findById(
          entity.id_category,
        );
        const measurementUnit = await this.measurementUnitsService.findById(
          entity.id_measurement,
        );

        return {
          id: entity.id,
          name: entity.name,
          price: parseFloat(entity.price),
          expiring_date: entity.expiring_date,
          min_stock: entity.min_stock,
          stock: entity.stock,
          category,
          measurement_unit: measurementUnit,
        };
      }),
    );
  }

  async create(dto: CreateSupplyDto): Promise<FindSupplyByIdResponseDto> {
    await this.categoriesService.findById(dto.categoryId);
    await this.measurementUnitsService.findById(dto.measurementUnitId);

    if (!dto.expiring_date) {
      throw new BadRequestBusinessException(
        'MISSING_EXPIRING_DATE',
        'La fecha de expiración es requerida',
        [{ field: 'expiring_date', message: 'El campo es requerido' }],
      );
    }

    const supplyData: CreateSupplyInput = {
      name: dto.name,
      price: dto.price,
      expiring_date: dto.expiring_date,
      min_stock: dto.min_stock ?? 0,
      stock: dto.stock ?? 0,
      id_category: dto.categoryId,
      id_measurement: dto.measurementUnitId,
    };

    const entity = await this.supplyRepository.create(supplyData);

    const category = await this.categoriesService.findById(entity.id_category);
    const measurementUnit = await this.measurementUnitsService.findById(
      entity.id_measurement,
    );

    return {
      id: entity.id,
      name: entity.name,
      price: parseFloat(entity.price),
      expiring_date: entity.expiring_date,
      min_stock: entity.min_stock,
      stock: entity.stock,
      category,
      measurement_unit: measurementUnit,
    };
  }

  async update(
    id: number,
    dto: UpdateSupplyDto,
  ): Promise<FindSupplyByIdResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestBusinessException(
        'MISSING_UPDATE_FIELDS',
        'Debes ingresar al menos un campo para actualizar',
        [{ field: 'body', message: 'Se requiere al menos un campo' }],
      );
    }

    const entity = await this.supplyRepository.findById(id);

    if (!entity) {
      throw new NotFoundBusinessException(
        'SUPPLY_NOT_FOUND',
        'El producto no fue encontrado',
        { supply_id: id },
      );
    }

    const updateData: {
      id: number;
      name: string;
      price: string;
      expiring_date: Date | null;
      min_stock: number;
      stock: number;
      id_category?: number;
      id_measurement?: number;
    } = {
      id: entity.id,
      name: dto.name ?? entity.name,
      price: dto.price !== undefined ? String(dto.price) : entity.price,
      expiring_date: dto.expiring_date ?? entity.expiring_date,
      min_stock: dto.min_stock ?? entity.min_stock,
      stock: dto.stock ?? entity.stock,
    };

    if (dto.categoryId) {
      await this.categoriesService.findById(dto.categoryId);
      updateData.id_category = dto.categoryId;
    }

    if (dto.measurementUnitId) {
      await this.measurementUnitsService.findById(dto.measurementUnitId);
      updateData.id_measurement = dto.measurementUnitId;
    }

    const updatedEntity = await this.supplyRepository.update(updateData);

    if (!updatedEntity) {
      throw new NotFoundBusinessException(
        'SUPPLY_UPDATE_RETRIEVAL_ERROR',
        'El producto no fue encontrado al actualizar',
      );
    }

    const category = await this.categoriesService.findById(
      updatedEntity.id_category,
    );
    const measurementUnit = await this.measurementUnitsService.findById(
      updatedEntity.id_measurement,
    );

    return {
      id: updatedEntity.id,
      name: updatedEntity.name,
      price: parseFloat(updatedEntity.price),
      expiring_date: updatedEntity.expiring_date,
      min_stock: updatedEntity.min_stock,
      stock: updatedEntity.stock,
      category,
      measurement_unit: measurementUnit,
    };
  }

  async delete(id: number): Promise<void> {
    const entity = await this.supplyRepository.findById(id);

    if (!entity) {
      throw new NotFoundBusinessException(
        'SUPPLY_NOT_FOUND',
        'El producto no fue encontrado',
        { supply_id: id },
      );
    }

    await this.supplyRepository.delete(id);
  }
}
