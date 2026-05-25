import { Inject, Injectable } from '@nestjs/common';

import {
  BadRequestBusinessException,
  ForbiddenBusinessException,
  NotFoundBusinessException,
} from '../../../common/exceptions';
import { CurrentUserPayload } from '../../../common/types/current-user.type';
import { ISupplyRepository } from '../../inventory/supplies/repositories/supply.repository.interface';
import {
  IVetRepository,
  VET_REPOSITORY,
} from '../../vets/vet/repositories/vet.repository.interface';
import {
  CreateMedicalRecordDto,
  CreateMedicineDetailDto,
  CreateVaccineDetailDto,
} from '../dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../dto/update-medical-record.dto';
import {
  IMedicalRecordRepository,
  MEDICAL_RECORD_REPOSITORY,
  MedicalRecordWithPet,
  UpdateMedicalRecordInput,
} from '../repositories/medical-record.repository.interface';
import {
  IMedicineDetailRepository,
  MEDICINE_DETAIL_REPOSITORY,
} from '../repositories/medicine-detail.repository.interface';
import {
  IPetWeightRepository,
  PET_WEIGHT_REPOSITORY,
} from '../repositories/pet-weight.repository.interface';
import {
  IVaccineDetailRepository,
  VACCINE_DETAIL_REPOSITORY,
} from '../repositories/vaccine-detail.repository.interface';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @Inject(MEDICAL_RECORD_REPOSITORY)
    private readonly medicalRecordRepository: IMedicalRecordRepository,

    @Inject(MEDICINE_DETAIL_REPOSITORY)
    private readonly medicineDetailRepository: IMedicineDetailRepository,

    @Inject(VACCINE_DETAIL_REPOSITORY)
    private readonly vaccineDetailRepository: IVaccineDetailRepository,

    @Inject(PET_WEIGHT_REPOSITORY)
    private readonly petWeightRepository: IPetWeightRepository,

    private readonly supplyRepository: ISupplyRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,
  ) {}

  private async buildDetail(record: MedicalRecordWithPet) {
    const [medicines, vaccines] = await Promise.all([
      this.medicineDetailRepository.findByMedicalRecordId(record.id),
      this.vaccineDetailRepository.findByMedicalRecordId(record.id),
    ]);

    return {
      ...record,
      medicines,
      vaccines,
    };
  }

  async create(dto: CreateMedicalRecordDto) {
    const existing = await this.medicalRecordRepository.findByAppointmentId(
      dto.appointment_id,
    );

    if (existing) {
      throw new BadRequestBusinessException(
        'MEDICAL_RECORD_ALREADY_EXISTS',
        'La cita ya tiene un historial médico registrado',
        undefined,
        { appointment_id: dto.appointment_id },
      );
    }

    const record = await this.medicalRecordRepository.create({
      appointment_id: dto.appointment_id,
      visit_reason: dto.visit_reason,
      diagnosis: dto.diagnosis,
      treatment: dto.treatment,
      weight_at_visit: String(dto.weight_at_visit),
      next_visit_date: dto.next_visit_date
        ? new Date(dto.next_visit_date)
        : null,
    });

    const clinicMedicines = dto.medicines?.filter(
      (m: CreateMedicineDetailDto) => m.supply_id !== undefined,
    );

    for (const medicine of clinicMedicines ?? []) {
      if (medicine.supply_id === undefined) {
        continue;
      }

      const supply = await this.supplyRepository.findById(medicine.supply_id);

      if (!supply) {
        throw new BadRequestBusinessException(
          'SUPPLY_NOT_FOUND',
          `El medicamento con ID ${String(medicine.supply_id)} no existe en el inventario`,
        );
      }

      if (supply.stock < medicine.quantity) {
        throw new BadRequestBusinessException(
          'INSUFFICIENT_STOCK',
          `Stock insuficiente para ${supply.name}. Disponible: ${String(supply.stock)}, Requerido: ${String(medicine.quantity)}`,
        );
      }

      await this.supplyRepository.update({
        id: supply.id,
        stock: supply.stock - medicine.quantity,
      });
    }

    await this.medicineDetailRepository.createMany(
      dto.medicines?.map((medicine: CreateMedicineDetailDto) => ({
        medical_record_id: record.id,
        supply_id: medicine.supply_id ?? null,
        quantity: medicine.quantity,
        dose: medicine.dose,
        duration: medicine.duration,
      })) ?? [],
    );

    await this.vaccineDetailRepository.createMany(
      dto.vaccines?.map((vaccine: CreateVaccineDetailDto) => ({
        medical_record_id: record.id,
        supply_id: vaccine.supply_id,
        applied_date: new Date(vaccine.applied_date),
        next_dose_date: vaccine.next_dose_date
          ? new Date(vaccine.next_dose_date)
          : null,
      })) ?? [],
    );

    const created = await this.medicalRecordRepository.findById(record.id);

    if (!created) {
      throw new NotFoundBusinessException(
        'MEDICAL_RECORD_RETRIEVAL_ERROR',
        'No se pudo consultar el historial médico creado',
      );
    }

    await this.petWeightRepository.updateWeight(
      created.pet_id,
      String(dto.weight_at_visit),
    );

    return this.buildDetail(created);
  }

  private async verifyVetOwnership(
    record: MedicalRecordWithPet,
    user: CurrentUserPayload,
  ): Promise<void> {
    if (user.rol === 'ADMINISTRADOR') {
      return;
    }

    if (user.rol === 'VETERINARIO') {
      const vet = await this.vetRepository.findByUserId(user.id);
      if (vet?.id !== record.vet_id) {
        throw new ForbiddenBusinessException(
          'FORBIDDEN_RESOURCE',
          'No tienes permisos para acceder a este historial médico',
        );
      }
    }
  }

  async findAll(user: CurrentUserPayload) {
    const records = await this.medicalRecordRepository.findAll();

    const filtered =
      user.rol === 'CLIENTE'
        ? records.filter((r) => r.client_id === user.profileId)
        : records;

    return Promise.all(filtered.map((record) => this.buildDetail(record)));
  }

  async findById(id: number, user: CurrentUserPayload) {
    const record = await this.medicalRecordRepository.findById(id);

    if (!record) {
      throw new NotFoundBusinessException(
        'MEDICAL_RECORD_NOT_FOUND',
        'El historial médico ingresado no fue encontrado',
        { medical_record_id: id },
      );
    }

    if (user.rol === 'CLIENTE' && record.client_id !== user.profileId) {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'No tienes permisos para acceder a este historial médico',
      );
    }

    await this.verifyVetOwnership(record, user);

    return this.buildDetail(record);
  }

  async findByPetId(petId: number, user: CurrentUserPayload) {
    const records = await this.medicalRecordRepository.findByPetId(petId);

    const filtered =
      user.rol === 'CLIENTE'
        ? records.filter((r) => r.client_id === user.profileId)
        : records;

    return Promise.all(filtered.map((record) => this.buildDetail(record)));
  }

  async update(
    id: number,
    dto: UpdateMedicalRecordDto,
    user: CurrentUserPayload,
  ) {
    const record = await this.medicalRecordRepository.findById(id);

    if (!record) {
      throw new NotFoundBusinessException(
        'MEDICAL_RECORD_NOT_FOUND',
        'El historial médico ingresado no fue encontrado',
        { medical_record_id: id },
      );
    }

    await this.verifyVetOwnership(record, user);

    const createdAt = new Date(record.created_at);
    const limit = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    if (new Date() > limit) {
      throw new BadRequestBusinessException(
        'MEDICAL_RECORD_EDIT_WINDOW_EXPIRED',
        'El historial médico solo puede editarse durante las primeras 24 horas',
      );
    }

    const updateData: UpdateMedicalRecordInput = { id };

    if (dto.visit_reason !== undefined)
      updateData.visit_reason = dto.visit_reason;

    if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;

    if (dto.treatment !== undefined) updateData.treatment = dto.treatment;

    if (dto.weight_at_visit !== undefined)
      updateData.weight_at_visit = String(dto.weight_at_visit);

    if (dto.next_visit_date !== undefined)
      updateData.next_visit_date = new Date(dto.next_visit_date);

    const updated = await this.medicalRecordRepository.update(updateData);

    const updatedWithPet = await this.medicalRecordRepository.findById(
      updated.id,
    );

    if (!updatedWithPet) {
      throw new NotFoundBusinessException(
        'MEDICAL_RECORD_RETRIEVAL_ERROR',
        'No se pudo consultar el historial médico actualizado',
      );
    }

    if (dto.weight_at_visit !== undefined) {
      await this.petWeightRepository.updateWeight(
        updatedWithPet.pet_id,
        String(dto.weight_at_visit),
      );
    }

    return this.buildDetail(updatedWithPet);
  }

  async findVaccinesExpiringSoon(days: number) {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + days);

    const vaccines = await this.vaccineDetailRepository.findExpiringSoon(
      today,
      limit,
    );

    return vaccines;
  }
}
