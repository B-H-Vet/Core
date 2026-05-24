import type {
  EgressStatus,
  Hospitalization,
} from '../../../database/schema/hospitalizations/hospitalizations.schema';

export const HOSPITALIZATION_REPOSITORY = 'HOSPITALIZATION_REPOSITORY';

export abstract class IHospitalizationRepository {
  abstract create(petId: number): Promise<Hospitalization>;
  abstract findAll(): Promise<Hospitalization[]>;
  abstract findById(id: number): Promise<Hospitalization | null>;
  abstract findByPetId(petId: number): Promise<Hospitalization[]>;
  abstract findActiveByPetId(petId: number): Promise<Hospitalization | null>;

  abstract discharge(data: {
    id: number;
    egress_status: EgressStatus;
  }): Promise<Hospitalization>;

  abstract softDelete(id: number): Promise<void>;
}
