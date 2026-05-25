export const VET_SPECIALTIES_REPOSITORY = 'VET_SPECIALTIES_REPOSITORY';

export interface VetSpecialty {
  vet_id: number;
  specialty_id: number;
}

export abstract class IVetSpecialtiesRepository {
  abstract findByVetId(vetId: number): Promise<VetSpecialty[]>;

  abstract createMany(entries: VetSpecialty[]): Promise<void>;

  abstract deleteByVetId(vetId: number): Promise<void>;

  abstract deleteByVetIdAndSpecialtyIds(
    vetId: number,
    specialtyIds: number[],
  ): Promise<void>;
}
