import type { EgressStatus } from '../../../../database/schema/hospitalizations/hospitalizations.schema';

export class DischargeHospitalizationResponseDto {
  id!: number;
  pet_id!: number;
  vet_id!: number;
  admission_date!: Date;
  egress_date!: Date;
  egress_status!: EgressStatus;
  created_at!: Date;
  updated_at!: Date;
}
