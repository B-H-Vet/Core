import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ISupplyRepository,
  SUPPLY_REPOSITORY,
} from '../repositories/supply.repository.interface';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../repositories/category.repository.interface';
import {
  IMeasurementUnitRepository,
  MEASUREMENT_UNIT_REPOSITORY,
} from '../repositories/measurement-unit.repository.interface';
import { CreateSupplyDto } from '../dto/create-supply.dto';
import { UpdateSupplyDto } from '../dto/update-supply.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CreateMeasurementUnitDto } from '../dto/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../dto/update-measurement-unit.dto';

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

  //Supplies

  async findAllSupplies(): Promise<any[]> {
    return this.supplyRepository.findAll();
  }

  async findSupplyById(id: number): Promise<any> {
    const supply = await this.supplyRepository.findById(id);
    if (!supply) {
      throw new NotFoundException('El producto no fue encontrado');
    }
    return supply;
  }

  async findLowStock(): Promise<any[]> {
    return this.supplyRepository.findLowStock();
  }

  async findExpiringSoon(days: number = 30): Promise<any[]> {
    return this.supplyRepository.findExpiringSoon(days);
  }

  async createSupply(dto: CreateSupplyDto): Promise<any> {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException('La categoría no fue encontrada');
    }

    const measurementUnit = await this.measurementUnitRepository.findById(dto.measurementUnitId);
    if (!measurementUnit) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    return this.supplyRepository.create({
      name: dto.name,
      price: dto.price,
      expiring_date: dto.expiring_date,
      min_stock: dto.min_stock ?? 0,
      stock: dto.stock ?? 0,
      category,
      measurement_unit: measurementUnit,
    });
  }

  async updateSupply(id: number, dto: UpdateSupplyDto): Promise<any> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Debes ingresar al menos un campo para actualizar');
    }

    const supply = await this.supplyRepository.findById(id);
    if (!supply) {
      throw new NotFoundException('El producto no fue encontrado');
    }

    if (dto.name) supply.name = dto.name;
    if (dto.price !== undefined) supply.price = dto.price;
    if (dto.expiring_date) supply.expiring_date = dto.expiring_date;
    if (dto.min_stock !== undefined) supply.min_stock = dto.min_stock;
    if (dto.stock !== undefined) supply.stock = dto.stock;

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new NotFoundException('La categoría no fue encontrada');
      supply.category = category;
    }

    if (dto.measurementUnitId) {
      const unit = await this.measurementUnitRepository.findById(dto.measurementUnitId);
      if (!unit) throw new NotFoundException('La unidad de medida no fue encontrada');
      supply.measurement_unit = unit;
    }

    return this.supplyRepository.update(supply);
  }

  async deleteSupply(id: number): Promise<any> {  // ← nuevo
    const supply = await this.supplyRepository.findById(id);
    if (!supply) {
      throw new NotFoundException('El producto no fue encontrado');
    }
    return this.supplyRepository.delete(id);
  }

  //Categories 

  async findAllCategories(): Promise<any[]> {
    return this.categoryRepository.findAll();
  }

  async findCategoryById(id: number): Promise<any> {  // ← nuevo
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('La categoría no fue encontrada');
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<any> {
    return this.categoryRepository.create({ name: dto.name });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<any> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Debes ingresar al menos un campo para actualizar');
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

  async findAllMeasurementUnits(): Promise<any[]> {
    return this.measurementUnitRepository.findAll();
  }

  async findMeasurementUnitById(id: number): Promise<any> {  // ← nuevo
    const unit = await this.measurementUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }
    return unit;
  }

  async createMeasurementUnit(dto: CreateMeasurementUnitDto): Promise<any> {
    return this.measurementUnitRepository.create({ unit: dto.unit });
  }

  async updateMeasurementUnit(id: number, dto: UpdateMeasurementUnitDto): Promise<any> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Debes ingresar al menos un campo para actualizar');
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