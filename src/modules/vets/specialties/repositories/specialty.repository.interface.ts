import { type Specialty } from '../../../../database/schema/specialties/specialties.schema';

export const SPECIALTY_REPOSITORY = 'SPECIALTY_REPOSITORY';

export abstract class ISpecialtyRepository {
  abstract findAll(): Promise<Specialty[]>;
  abstract findById(id: number): Promise<Specialty | null>;
  abstract create(specialty: Partial<Specialty>): Promise<Specialty>;
  abstract update(
    specialty: Partial<Specialty> & { id: number },
  ): Promise<Specialty>;
  abstract delete(id: number): Promise<void>;
}
