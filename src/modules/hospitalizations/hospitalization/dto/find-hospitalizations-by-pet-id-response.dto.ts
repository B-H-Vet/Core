import type { EgressStatus } from '../../../../database/schema/hospitalizations/hospitalizations.schema';

export class FindHospitalizationsByPetIdResponseDto {
  data!: {
    id: number;
    pet_id: number;
    vet_id: number;
    admission_date: Date;
    egress_date: Date | null;
    egress_status: EgressStatus | null;
    created_at: Date;
    updated_at: Date;
  }[];
}
