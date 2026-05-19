import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateMeasurementUnitDto } from '../dto/create-measurement-unit.dto';
import { CreateSupplyDto } from '../dto/create-supply.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UpdateMeasurementUnitDto } from '../dto/update-measurement-unit.dto';
import { UpdateSupplyDto } from '../dto/update-supply.dto';
import {
  CATEGORY_REPOSITORY,
  ICategoryRepository,
} from '../repositories/category.repository.interface';
import {
  MEASUREMENT_UNIT_REPOSITORY,
  IMeasurementUnitRepository,
} from '../repositories/measurement-unit.repository.interface';
import {
  SUPPLY_REPOSITORY,
  ISupplyRepository,
} from '../repositories/supply.repository.interface';
import {
  Category,
  MeasurementUnit,
  Supply,
  SupplyRow,
  CreateCategoryData,
  CreateMeasurementUnitData,
  CreateSupplyData,
} from '../types/inventory.types';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(SUPPLY_REPOSITORY)
    private readonly supplyRepository: ISupplyRepository,

    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,

    @Inject(MEASUREMENT_UNIT_REPOSITORY)
    private readonly measurementUnitRepository: IMeasurementUnitRepository,
  ) {}

  //Helpers

  private async enrichSupply(row: SupplyRow): Promise<Supply> {
    const category = await this.categoryRepository.findById(row.id_category);
    const measurementUnit = await this.measurementUnitRepository.findById(
      row.id_measurement,
    );

    if (!category) {
      throw new NotFoundException(
        'La categoría del producto no fue encontrada',
      );
    }

    if (!measurementUnit) {
      throw new NotFoundException(
        'La unidad de medida del producto no fue encontrada',
      );
    }

    return {
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      expiring_date: row.expiring_date,
      min_stock: row.min_stock,
      stock: row.stock,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
      category,
      measurement_unit: measurementUnit,
    } as Supply;
  }
  //Supplies

  async findAllSupplies(): Promise<Supply[]> {
    const rows = await this.supplyRepository.findAll();
    return Promise.all(rows.map((row) => this.enrichSupply(row)));
  }

  async findSupplyById(id: number): Promise<Supply> {
    const row = await this.supplyRepository.findById(id);

    if (!row) {
      throw new NotFoundException('El producto no fue encontrado');
    }

    return this.enrichSupply(row);
  }

  async findLowStock(): Promise<Supply[]> {
    const rows = await this.supplyRepository.findLowStock();
    return Promise.all(rows.map((row) => this.enrichSupply(row)));
  }

  async findExpiringSoon(days = 30): Promise<Supply[]> {
    const rows = await this.supplyRepository.findExpiringSoon(days);
    return Promise.all(rows.map((row) => this.enrichSupply(row)));
  }

  async createSupply(dto: CreateSupplyDto): Promise<Supply> {
    const category = await this.categoryRepository.findById(dto.categoryId);

    if (!category) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    const measurementUnit = await this.measurementUnitRepository.findById(
      dto.measurementUnitId,
    );

    if (!measurementUnit) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    if (!dto.expiring_date) {
      throw new BadRequestException('La fecha de expiración es requerida');
    }

    const supplyData: CreateSupplyData = {
      name: dto.name,
      price: dto.price,
      expiring_date: dto.expiring_date,
      min_stock: dto.min_stock ?? 0,
      stock: dto.stock ?? 0,
      category,
      measurement_unit: measurementUnit,
    };

    const row = await this.supplyRepository.create(supplyData);
    return this.enrichSupply(row);
  }

  async updateSupply(id: number, dto: UpdateSupplyDto): Promise<Supply> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const row = await this.supplyRepository.findById(id);

    if (!row) {
      throw new NotFoundException('El producto no fue encontrado');
    }

    const supply = await this.enrichSupply(row);

    if (dto.name) supply.name = dto.name;
    if (dto.price !== undefined) supply.price = dto.price;
    if (dto.expiring_date) supply.expiring_date = dto.expiring_date;
    if (dto.min_stock !== undefined) supply.min_stock = dto.min_stock;
    if (dto.stock !== undefined) supply.stock = dto.stock;

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);

      if (!category) {
        throw new NotFoundException('La categoría no fue encontrada');
      }

      supply.category = category;
    }

    if (dto.measurementUnitId) {
      const unit = await this.measurementUnitRepository.findById(
        dto.measurementUnitId,
      );

      if (!unit) {
        throw new NotFoundException('La unidad de medida no fue encontrada');
      }

      supply.measurement_unit = unit;
    }

    const updatedRow = await this.supplyRepository.update(supply);

    if (!updatedRow) {
      throw new NotFoundException(
        'El producto no fue encontrado al actualizar',
      );
    }

    return this.enrichSupply(updatedRow);
  }

  async deleteSupply(id: number): Promise<void> {
    const row = await this.supplyRepository.findById(id);

    if (!row) {
      throw new NotFoundException('El producto no fue encontrado');
    }

    await this.supplyRepository.delete(id);
  }

  //Categories

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const categoryData: CreateCategoryData = {
      name: dto.name,
    };

    return this.categoryRepository.create(categoryData);
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<Category | null> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    if (dto.name) category.name = dto.name;
    if (dto.is_active !== undefined) category.is_active = dto.is_active;

    return this.categoryRepository.update(category);
  }

  async desactivarCategory(id: number): Promise<string> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    if (!category.is_active) {
      throw new BadRequestException('La categoría ya está desactivada');
    }

    category.is_active = false;

    await this.categoryRepository.update(category);

    return 'La categoría fue desactivada correctamente';
  }

  //Measurement Units

  async findAllMeasurementUnits(): Promise<MeasurementUnit[]> {
    return this.measurementUnitRepository.findAll();
  }

  async findMeasurementUnitById(id: number): Promise<MeasurementUnit> {
    const unit = await this.measurementUnitRepository.findById(id);

    if (!unit) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    return unit;
  }

  async createMeasurementUnit(
    dto: CreateMeasurementUnitDto,
  ): Promise<MeasurementUnit> {
    const unitData: CreateMeasurementUnitData = {
      unit: dto.unit,
    };

    return this.measurementUnitRepository.create(unitData);
  }

  async updateMeasurementUnit(
    id: number,
    dto: UpdateMeasurementUnitDto,
  ): Promise<MeasurementUnit | null> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const unit = await this.measurementUnitRepository.findById(id);

    if (!unit) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    if (dto.unit) unit.unit = dto.unit;

    return this.measurementUnitRepository.update(unit);
  }

  async desactivarMeasurementUnit(id: number): Promise<string> {
    const unit = await this.measurementUnitRepository.findById(id);

    if (!unit) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    await this.measurementUnitRepository.delete(id);

    return 'La unidad de medida fue desactivada correctamente';
  }
}
