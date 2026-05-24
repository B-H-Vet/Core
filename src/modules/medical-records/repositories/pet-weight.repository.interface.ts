export const PET_WEIGHT_REPOSITORY = 'PET_WEIGHT_REPOSITORY';

export abstract class IPetWeightRepository {
  abstract updateWeight(petId: number, weight: string): Promise<void>;
}