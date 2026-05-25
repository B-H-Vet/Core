import type { MedicalRecord } from '../../../database/schema/medical-records/medical-records.schema';

export const MEDICAL_RECORD_REPOSITORY = 'MEDICAL_RECORD_REPOSITORY';

export interface CreateMedicalRecordInput {
  appointment_id: number;
  visit_reason: string;
  diagnosis: string;
  treatment: string;
  weight_at_visit: string;
  next_visit_date?: Date | null;
}

export interface UpdateMedicalRecordInput {
  id: number;
  visit_reason?: string;
  diagnosis?: string;
  treatment?: string;
  weight_at_visit?: string;
  next_visit_date?: Date | null;
}

export interface MedicalRecordWithPet extends MedicalRecord {
  pet_id: number;
  client_id: number;
  vet_id: number;
}

export abstract class IMedicalRecordRepository {
  abstract create(data: CreateMedicalRecordInput): Promise<MedicalRecord>;
  abstract findAll(): Promise<MedicalRecordWithPet[]>;
  abstract findById(id: number): Promise<MedicalRecordWithPet | null>;
  abstract findByPetId(petId: number): Promise<MedicalRecordWithPet[]>;
  abstract findByAppointmentId(
    appointmentId: number,
  ): Promise<MedicalRecord | null>;
  abstract update(data: UpdateMedicalRecordInput): Promise<MedicalRecord>;
}
