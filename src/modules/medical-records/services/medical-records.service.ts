import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
} from '../repositories/medical-record.repository.interface';

import {
  IMedicineDetailRepository,
  MEDICINE_DETAIL_REPOSITORY,
} from '../repositories/medicine-detail.repository.interface';

import {
  IVaccineDetailRepository,
  VACCINE_DETAIL_REPOSITORY,
} from '../repositories/vaccine-detail.repository.interface';

import {
  IPetWeightRepository,
  PET_WEIGHT_REPOSITORY,
} from '../repositories/pet-weight.repository.interface';

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
    const existing =
      await this.medicalRecordRepository.findByAppointmentId(
        dto.appointment_id,
      );

    if (existing) {
      throw new BadRequestException(
        'La cita ya tiene un historial médico registrado',
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

    await this.medicineDetailRepository.createMany(
      dto.medicines?.map((medicine: CreateMedicineDetailDto) => ({
        medical_record_id: record.id,
        supply_id: medicine.supply_id,
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
      throw new NotFoundException(
        'No se pudo consultar el historial médico creado',
      );
    }

    await this.petWeightRepository.updateWeight(
      created.pet_id,
      String(dto.weight_at_visit),
    );

    return this.buildDetail(created);
  }

  async findAll() {
    const records = await this.medicalRecordRepository.findAll();
    return Promise.all(records.map((record) => this.buildDetail(record)));
  }

  async findById(id: number) {
    const record = await this.medicalRecordRepository.findById(id);

    if (!record) {
      throw new NotFoundException(
        'El historial médico ingresado no fue encontrado',
      );
    }

    return this.buildDetail(record);
  }

  async findByPetId(petId: number) {
    const records = await this.medicalRecordRepository.findByPetId(petId);
    return Promise.all(records.map((record) => this.buildDetail(record)));
  }

  async update(id: number, dto: UpdateMedicalRecordDto) {
    const record = await this.medicalRecordRepository.findById(id);

    if (!record) {
      throw new NotFoundException(
        'El historial médico ingresado no fue encontrado',
      );
    }

    const createdAt = new Date(record.created_at);
    const limit = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    if (new Date() > limit) {
      throw new BadRequestException(
        'El historial médico solo puede editarse durante las primeras 24 horas',
      );
    }

    const updateData: any = { id };

    if (dto.visit_reason !== undefined)
      updateData.visit_reason = dto.visit_reason;

    if (dto.diagnosis !== undefined)
      updateData.diagnosis = dto.diagnosis;

    if (dto.treatment !== undefined)
      updateData.treatment = dto.treatment;

    if (dto.weight_at_visit !== undefined)
      updateData.weight_at_visit = String(dto.weight_at_visit);

    if (dto.next_visit_date !== undefined)
      updateData.next_visit_date = new Date(dto.next_visit_date);

    const updated = await this.medicalRecordRepository.update(updateData);

    const updatedWithPet = await this.medicalRecordRepository.findById(
      updated.id,
    );

    if (!updatedWithPet) {
      throw new NotFoundException(
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
}