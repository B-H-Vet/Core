import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { appointments } from '../../../database/schema/appointments/appointments.schema';
import {
  medicalRecords,
  type MedicalRecord,
} from '../../../database/schema/medical-records/medical-records.schema';

import {
  CreateMedicalRecordInput,
  IMedicalRecordRepository,
  MedicalRecordWithPet,
  UpdateMedicalRecordInput,
} from './medical-record.repository.interface';

@Injectable()
export class MedicalRecordRepository extends IMedicalRecordRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(data: CreateMedicalRecordInput): Promise<MedicalRecord> {
    await this.db.insert(medicalRecords).values({
      appointment_id: data.appointment_id,
      visit_reason: data.visit_reason,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      weight_at_visit: data.weight_at_visit,
      next_visit_date: data.next_visit_date ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.appointment_id, data.appointment_id))
      .limit(1);

    if (!result[0]) {
      throw new Error('Error al crear el historial médico');
    }

    return result[0];
  }

  async findAll(): Promise<MedicalRecordWithPet[]> {
    const result = await this.db
      .select({
        id: medicalRecords.id,
        appointment_id: medicalRecords.appointment_id,
        visit_reason: medicalRecords.visit_reason,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        weight_at_visit: medicalRecords.weight_at_visit,
        next_visit_date: medicalRecords.next_visit_date,
        created_at: medicalRecords.created_at,
        updated_at: medicalRecords.updated_at,
        pet_id: appointments.pet_id,
        client_id: appointments.client_id,
        vet_id: appointments.vet_id,
      })
      .from(medicalRecords)
      .innerJoin(
        appointments,
        eq(medicalRecords.appointment_id, appointments.id),
      );

    return result;
  }

  async findById(id: number): Promise<MedicalRecordWithPet | null> {
    const result = await this.db
      .select({
        id: medicalRecords.id,
        appointment_id: medicalRecords.appointment_id,
        visit_reason: medicalRecords.visit_reason,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        weight_at_visit: medicalRecords.weight_at_visit,
        next_visit_date: medicalRecords.next_visit_date,
        created_at: medicalRecords.created_at,
        updated_at: medicalRecords.updated_at,
        pet_id: appointments.pet_id,
        client_id: appointments.client_id,
        vet_id: appointments.vet_id,
      })
      .from(medicalRecords)
      .innerJoin(
        appointments,
        eq(medicalRecords.appointment_id, appointments.id),
      )
      .where(eq(medicalRecords.id, id))
      .limit(1);

    return (result[0] as MedicalRecordWithPet | undefined) ?? null;
  }

  async findByPetId(petId: number): Promise<MedicalRecordWithPet[]> {
    const result = await this.db
      .select({
        id: medicalRecords.id,
        appointment_id: medicalRecords.appointment_id,
        visit_reason: medicalRecords.visit_reason,
        diagnosis: medicalRecords.diagnosis,
        treatment: medicalRecords.treatment,
        weight_at_visit: medicalRecords.weight_at_visit,
        next_visit_date: medicalRecords.next_visit_date,
        created_at: medicalRecords.created_at,
        updated_at: medicalRecords.updated_at,
        pet_id: appointments.pet_id,
        client_id: appointments.client_id,
        vet_id: appointments.vet_id,
      })
      .from(medicalRecords)
      .innerJoin(
        appointments,
        eq(medicalRecords.appointment_id, appointments.id),
      )
      .where(eq(appointments.pet_id, petId));

    return result;
  }

  async findByAppointmentId(
    appointmentId: number,
  ): Promise<MedicalRecord | null> {
    const result = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.appointment_id, appointmentId))
      .limit(1);

    return result[0] ?? null;
  }

  async update(data: UpdateMedicalRecordInput): Promise<MedicalRecord> {
    await this.db
      .update(medicalRecords)
      .set({
        visit_reason: data.visit_reason,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        weight_at_visit: data.weight_at_visit,
        next_visit_date: data.next_visit_date,
        updated_at: new Date(),
      })
      .where(eq(medicalRecords.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new Error('Error al actualizar el historial médico');
    }

    return updated;
  }
}
