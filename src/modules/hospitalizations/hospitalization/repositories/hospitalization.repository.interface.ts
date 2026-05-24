import type {
  EgressStatus,
  Hospitalization,
} from '../../../../database/schema/hospitalizations/hospitalizations.schema';

export const HOSPITALIZATION_REPOSITORY = 'HOSPITALIZATION_REPOSITORY';

export interface HospitalizationWithPet extends Hospitalization {
  pet: { client_id: number };
}

export abstract class IHospitalizationRepository {
  abstract create(petId: number, vetId: number): Promise<Hospitalization>;
  abstract findAll(): Promise<Hospitalization[]>;
  abstract findById(id: number): Promise<Hospitalization | null>;
  abstract findByIdWithPet(id: number): Promise<HospitalizationWithPet | null>;
  abstract findByPetId(petId: number): Promise<Hospitalization[]>;
  abstract findByClientId(clientId: number): Promise<Hospitalization[]>;
  abstract findActiveByPetId(petId: number): Promise<Hospitalization | null>;

  abstract discharge(data: {
    id: number;
    egress_status: EgressStatus;
  }): Promise<Hospitalization>;

  abstract softDelete(id: number): Promise<void>;
}
