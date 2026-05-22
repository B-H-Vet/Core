import type { CategorySummaryResponseDto } from './category-summary-response.dto';
import type { MeasurementUnitSummaryResponseDto } from './measurement-unit-summary-response.dto';

export class FindSupplyByIdResponseDto {
  id!: number;
  name!: string;
  price!: number;
  expiring_date!: Date | null;
  min_stock!: number;
  stock!: number;
  category!: CategorySummaryResponseDto;
  measurement_unit!: MeasurementUnitSummaryResponseDto;
}
