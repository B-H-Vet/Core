import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateMeasurementUnitDto } from '../dto/create-measurement-unit.dto';
import { FindAllMeasurementUnitsResponseDto } from '../dto/find-all-measurement-units-response.dto';
import { FindMeasurementUnitByIdResponseDto } from '../dto/find-measurement-unit-by-id-response.dto';
import { UpdateMeasurementUnitDto } from '../dto/update-measurement-unit.dto';
import { IMeasurementUnitRepository } from '../repositories/measurement-unit.repository.interface';
import { CreateMeasurementUnitData } from '../types/measurement-unit.types';

@Injectable()
export class MeasurementUnitsService {
  constructor(
    private readonly measurementUnitRepository: IMeasurementUnitRepository,
  ) {}

  async findAll(): Promise<FindAllMeasurementUnitsResponseDto[]> {
    const entities = await this.measurementUnitRepository.findAll();
    return entities.map((entity) => ({
      id: entity.id,
      unit: entity.unit,
    }));
  }

  async findById(id: number): Promise<FindMeasurementUnitByIdResponseDto> {
    const entity = await this.measurementUnitRepository.findById(id);

    if (!entity) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    return {
      id: entity.id,
      unit: entity.unit,
    };
  }

  async create(
    dto: CreateMeasurementUnitDto,
  ): Promise<FindMeasurementUnitByIdResponseDto> {
    const unitData: CreateMeasurementUnitData = {
      unit: dto.unit,
    };

    const entity = await this.measurementUnitRepository.create(unitData);
    return {
      id: entity.id,
      unit: entity.unit,
    };
  }

  async update(
    id: number,
    dto: UpdateMeasurementUnitDto,
  ): Promise<FindMeasurementUnitByIdResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debes ingresar al menos un campo para actualizar',
      );
    }

    const entity = await this.measurementUnitRepository.findById(id);

    if (!entity) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    if (dto.unit) entity.unit = dto.unit;

    const updated = await this.measurementUnitRepository.update(entity);

    if (!updated) {
      throw new NotFoundException(
        'La unidad de medida no fue encontrada al actualizar',
      );
    }

    return {
      id: updated.id,
      unit: updated.unit,
    };
  }

  async desactivar(id: number): Promise<string> {
    const entity = await this.measurementUnitRepository.findById(id);

    if (!entity) {
      throw new NotFoundException('La unidad de medida no fue encontrada');
    }

    await this.measurementUnitRepository.delete(id);

    return 'La unidad de medida fue desactivada correctamente';
  }
}
