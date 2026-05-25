import { randomInt } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import {
  BadRequestBusinessException,
  ForbiddenBusinessException,
  NotFoundBusinessException,
} from '../../../common/exceptions';
import { CurrentUserPayload } from '../../../common/types/current-user.type';
import { AddAdditionalServiceResponseDto } from '../dto/add-additional-service-response.dto';
import { AddAdditionalServiceDto } from '../dto/add-additional-service.dto';
import { ApplyDiscountResponseDto } from '../dto/apply-discount-response.dto';
import { ApplyDiscountDto } from '../dto/apply-discount.dto';
import { CancelInvoiceResponseDto } from '../dto/cancel-invoice-response.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';
import { CreateInvoiceResponseDto } from '../dto/create-invoice-response.dto';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { InvoiceDetailResponseDto } from '../dto/invoice-detail-response.dto';
import { InvoiceListItemResponseDto } from '../dto/invoice-list-item-response.dto';
import {
  INVOICE_ADDITIONAL_SERVICE_REPOSITORY,
  IInvoiceAdditionalServiceRepository,
} from '../repositories/invoice-additional-service.repository.interface';
import {
  INVOICE_INVENTORY_ITEM_REPOSITORY,
  IInvoiceInventoryItemRepository,
} from '../repositories/invoice-inventory-item.repository.interface';
import {
  INVOICE_MEDICINE_DETAIL_REPOSITORY,
  IInvoiceMedicineDetailRepository,
} from '../repositories/invoice-medicine-detail.repository.interface';
import {
  INVOICE_QUERY_REPOSITORY,
  IInvoiceQueryRepository,
} from '../repositories/invoice-query.repository.interface';
import {
  INVOICE_REPOSITORY,
  IInvoiceRepository,
} from '../repositories/invoice.repository.interface';

import { InvoiceCalculationService } from './invoice-calculation.service';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,

    @Inject(INVOICE_ADDITIONAL_SERVICE_REPOSITORY)
    private readonly invoiceAdditionalServiceRepository: IInvoiceAdditionalServiceRepository,

    @Inject(INVOICE_MEDICINE_DETAIL_REPOSITORY)
    private readonly invoiceMedicineDetailRepository: IInvoiceMedicineDetailRepository,

    @Inject(INVOICE_INVENTORY_ITEM_REPOSITORY)
    private readonly invoiceInventoryItemRepository: IInvoiceInventoryItemRepository,

    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepository: IInvoiceQueryRepository,

    private readonly invoiceCalculationService: InvoiceCalculationService,
  ) {}

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = randomInt(0, 10000).toString().padStart(4, '0');
    return `FAC-${String(timestamp)}-${random}`;
  }

  private async recalculateInvoiceTotals(invoiceId: number): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundBusinessException(
        'INVOICE_NOT_FOUND',
        'Factura no encontrada',
      );
    }

    const [medicines, additionalServices, inventoryItems] = await Promise.all([
      this.invoiceMedicineDetailRepository.findByInvoiceId(invoiceId),
      this.invoiceAdditionalServiceRepository.findByInvoiceId(invoiceId),
      this.invoiceInventoryItemRepository.findByInvoiceId(invoiceId),
    ]);

    const lines = [
      ...medicines.map((m) => ({
        basePrice: Number(m.unit_price) * m.quantity,
        finalPrice: Number(m.final_price),
      })),
      ...additionalServices.map((s) => ({
        basePrice: Number(s.unit_price),
        finalPrice: Number(s.final_price),
      })),
      ...inventoryItems.map((i) => ({
        basePrice: Number(i.unit_price) * i.quantity,
        finalPrice: Number(i.final_price),
      })),
    ];

    const paidAmount = Number(invoice.paid_amount);
    const totals = this.invoiceCalculationService.calculateInvoiceTotals(
      paidAmount,
      lines,
    );

    await this.invoiceRepository.update({
      id: invoiceId,
      subtotal_unpaid: String(totals.subtotalUnpaid),
      discount_total: String(totals.discountTotal),
      total_amount: String(totals.totalAmount),
      remaining_amount: String(totals.remainingAmount),
    });
  }

  async create(
    dto: CreateInvoiceDto,
    user: CurrentUserPayload,
  ): Promise<CreateInvoiceResponseDto> {
    if (user.rol !== 'RECEPCIONISTA' && user.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'Solo recepcionistas o administradores pueden crear facturas',
      );
    }

    const appointment = await this.invoiceQueryRepository.findAppointmentById(
      dto.appointment_id,
    );

    if (!appointment) {
      throw new NotFoundBusinessException(
        'APPOINTMENT_NOT_FOUND',
        'La cita ingresada no fue encontrada',
        { appointment_id: dto.appointment_id },
      );
    }

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_CANCELLED',
        'No se puede facturar una cita cancelada',
        undefined,
        { appointment_id: dto.appointment_id },
      );
    }

    if (appointment.status !== 'ATENDIDA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_NOT_COMPLETED',
        'Solo se puede facturar citas que ya fueron atendidas',
        undefined,
        { appointment_id: dto.appointment_id },
      );
    }

    const existingInvoice = await this.invoiceRepository.findByAppointmentId(
      dto.appointment_id,
    );

    if (existingInvoice) {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_INVOICED',
        'La cita ya tiene una factura asociada',
        undefined,
        { appointment_id: dto.appointment_id },
      );
    }

    const paidAmount =
      await this.invoiceQueryRepository.getAppointmentPaidAmount(
        dto.appointment_id,
      );
    const prescriptionMedicines =
      await this.invoiceQueryRepository.getPrescriptionMedicines(
        dto.appointment_id,
      );

    const invoice = await this.invoiceRepository.create({
      appointment_id: dto.appointment_id,
      invoice_number: this.generateInvoiceNumber(),
      paid_amount: String(paidAmount),
      subtotal_unpaid: '0.00',
      discount_total: '0.00',
      total_amount: String(paidAmount),
      remaining_amount: String(paidAmount),
    });

    const medicineLines = prescriptionMedicines
      .filter(
        (med): med is typeof med & { supply_id: number } =>
          med.supply_id !== null,
      )
      .map((med) => {
        const finalPrice =
          this.invoiceCalculationService.calculateLineFinalPrice(
            med.unit_price,
            med.quantity,
            0,
          );
        return {
          invoice_id: invoice.id,
          medicine_detail_id: med.medicine_detail_id,
          supply_id: med.supply_id,
          quantity: med.quantity,
          unit_price: String(med.unit_price),
          discount_percent: '0.00',
          final_price: String(finalPrice),
        };
      });

    await this.invoiceMedicineDetailRepository.createMany(medicineLines);

    await this.recalculateInvoiceTotals(invoice.id);

    const updatedInvoice = await this.invoiceRepository.findById(invoice.id);
    if (!updatedInvoice) {
      throw new NotFoundBusinessException(
        'INVOICE_RETRIEVAL_ERROR',
        'Error al consultar la factura creada',
      );
    }

    const invoiceMedicines =
      await this.invoiceQueryRepository.findInvoiceMedicineLines(invoice.id);

    return {
      id: updatedInvoice.id,
      appointment_id: updatedInvoice.appointment_id,
      invoice_number: updatedInvoice.invoice_number,
      status: updatedInvoice.status,
      paid_amount: Number(updatedInvoice.paid_amount),
      subtotal_unpaid: Number(updatedInvoice.subtotal_unpaid),
      discount_total: Number(updatedInvoice.discount_total),
      total_amount: Number(updatedInvoice.total_amount),
      remaining_amount: Number(updatedInvoice.remaining_amount),
      medicines: invoiceMedicines,
      created_at: updatedInvoice.created_at,
    };
  }

  async addAdditionalService(
    invoiceId: number,
    dto: AddAdditionalServiceDto,
    user: CurrentUserPayload,
  ): Promise<AddAdditionalServiceResponseDto> {
    if (user.rol !== 'RECEPCIONISTA' && user.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'Solo recepcionistas o administradores pueden agregar servicios a facturas',
      );
    }

    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundBusinessException(
        'INVOICE_NOT_FOUND',
        'La factura ingresada no fue encontrada',
        { invoice_id: invoiceId },
      );
    }

    if (invoice.status !== 'PENDIENTE') {
      throw new BadRequestBusinessException(
        'INVOICE_NOT_PENDING',
        'Solo se pueden agregar servicios a facturas pendientes de pago',
        undefined,
        { invoice_id: invoiceId, current_status: invoice.status },
      );
    }

    const service = await this.invoiceQueryRepository.findServiceById(
      dto.service_id,
    );

    if (!service) {
      throw new NotFoundBusinessException(
        'SERVICE_NOT_FOUND',
        'El servicio ingresado no fue encontrado',
        { service_id: dto.service_id },
      );
    }

    const discountPercent = dto.discount_percent ?? 0;
    const finalPrice = this.invoiceCalculationService.calculateLineFinalPrice(
      service.price,
      1,
      discountPercent,
    );

    const additionalService =
      await this.invoiceAdditionalServiceRepository.create({
        invoice_id: invoiceId,
        service_id: dto.service_id,
        unit_price: String(service.price),
        discount_percent: String(discountPercent),
        final_price: String(finalPrice),
      });

    await this.recalculateInvoiceTotals(invoiceId);

    const updatedInvoice = await this.invoiceRepository.findById(invoiceId);
    if (!updatedInvoice) {
      throw new NotFoundBusinessException(
        'INVOICE_RETRIEVAL_ERROR',
        'Error al consultar la factura actualizada',
      );
    }

    return {
      id: additionalService.id,
      invoice_id: additionalService.invoice_id,
      service_name: service.name,
      unit_price: Number(additionalService.unit_price),
      discount_percent: Number(additionalService.discount_percent),
      final_price: Number(additionalService.final_price),
      updated_totals: {
        subtotal_unpaid: Number(updatedInvoice.subtotal_unpaid),
        discount_total: Number(updatedInvoice.discount_total),
        total_amount: Number(updatedInvoice.total_amount),
        remaining_amount: Number(updatedInvoice.remaining_amount),
      },
    };
  }

  async applyDiscountToAdditionalService(
    invoiceId: number,
    serviceId: number,
    dto: ApplyDiscountDto,
    user: CurrentUserPayload,
  ): Promise<ApplyDiscountResponseDto> {
    if (user.rol !== 'RECEPCIONISTA' && user.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'Solo recepcionistas o administradores pueden aplicar descuentos',
      );
    }

    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundBusinessException(
        'INVOICE_NOT_FOUND',
        'La factura ingresada no fue encontrada',
        { invoice_id: invoiceId },
      );
    }

    if (invoice.status !== 'PENDIENTE') {
      throw new BadRequestBusinessException(
        'INVOICE_NOT_PENDING',
        'Solo se pueden aplicar descuentos a facturas pendientes de pago',
        undefined,
        { invoice_id: invoiceId, current_status: invoice.status },
      );
    }

    const additionalService =
      await this.invoiceAdditionalServiceRepository.findById(serviceId);
    if (additionalService?.invoice_id !== invoiceId) {
      throw new NotFoundBusinessException(
        'SERVICE_LINE_NOT_FOUND',
        'El servicio adicional no fue encontrado en esta factura',
        { service_id: serviceId, invoice_id: invoiceId },
      );
    }

    const finalPrice = this.invoiceCalculationService.calculateLineFinalPrice(
      Number(additionalService.unit_price),
      1,
      dto.discount_percent,
    );

    const updated =
      await this.invoiceAdditionalServiceRepository.updateDiscount({
        id: serviceId,
        discount_percent: String(dto.discount_percent),
        final_price: String(finalPrice),
      });

    await this.recalculateInvoiceTotals(invoiceId);

    const updatedInvoice = await this.invoiceRepository.findById(invoiceId);
    if (!updatedInvoice) {
      throw new NotFoundBusinessException(
        'INVOICE_RETRIEVAL_ERROR',
        'Error al consultar la factura actualizada',
      );
    }

    return {
      id: updated.id,
      item_type: 'additional_service',
      discount_percent: Number(updated.discount_percent),
      final_price: Number(updated.final_price),
      updated_totals: {
        subtotal_unpaid: Number(updatedInvoice.subtotal_unpaid),
        discount_total: Number(updatedInvoice.discount_total),
        total_amount: Number(updatedInvoice.total_amount),
        remaining_amount: Number(updatedInvoice.remaining_amount),
      },
    };
  }

  async findById(
    id: number,
    user: CurrentUserPayload,
  ): Promise<InvoiceDetailResponseDto> {
    const invoice =
      await this.invoiceQueryRepository.findInvoiceWithDetails(id);
    if (!invoice) {
      throw new NotFoundBusinessException(
        'INVOICE_NOT_FOUND',
        'La factura ingresada no fue encontrada',
        { invoice_id: id },
      );
    }

    if (user.rol === 'CLIENTE') {
      const appointment = await this.invoiceQueryRepository.findAppointmentById(
        invoice.appointment_id,
      );

      if (
        appointment?.client_id == null ||
        appointment.client_id !== (user.profileId ?? -1)
      ) {
        throw new ForbiddenBusinessException(
          'FORBIDDEN_RESOURCE',
          'No tienes permisos para acceder a esta factura',
        );
      }
    }

    const [medicinesData, additionalServicesData, inventoryItemsData] =
      await Promise.all([
        this.invoiceQueryRepository.findInvoiceMedicineLines(id),
        this.invoiceQueryRepository.findInvoiceServiceLines(id),
        this.invoiceQueryRepository.findInvoiceInventoryLines(id),
      ]);

    return {
      id: invoice.id,
      appointment_id: invoice.appointment_id,
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      paid_amount: invoice.paid_amount,
      subtotal_unpaid: invoice.subtotal_unpaid,
      discount_total: invoice.discount_total,
      total_amount: invoice.total_amount,
      remaining_amount: invoice.remaining_amount,
      paid_at: invoice.paid_at,
      cancellation_reason: invoice.cancellation_reason,
      cancelled_at: invoice.cancelled_at,
      medicines: medicinesData,
      additional_services: additionalServicesData,
      inventory_items: inventoryItemsData,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at,
    };
  }

  async findAll(
    pagination: PaginationParams,
    user: CurrentUserPayload,
  ): Promise<{
    data: InvoiceListItemResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    let invoicesList: InvoiceListItemResponseDto[];
    let total: number;

    if (user.rol === 'CLIENTE') {
      if (!user.profileId) {
        throw new ForbiddenBusinessException(
          'CLIENT_PROFILE_MISSING',
          'No tienes un perfil de cliente asociado',
        );
      }
      const { invoices, total: clientTotal } =
        await this.invoiceQueryRepository.findClientInvoices(user.profileId, {
          page,
          limit,
        });

      invoicesList = invoices.map((invoice) => ({
        id: invoice.id,
        appointment_id: invoice.appointment_id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        total_amount: invoice.total_amount,
        remaining_amount: invoice.remaining_amount,
        paid_at: invoice.paid_at,
        created_at: invoice.created_at,
      }));
      total = clientTotal;
    } else {
      const [repoInvoices, repoTotal] = await Promise.all([
        this.invoiceRepository.findAll({ page, limit }),
        this.invoiceRepository.count(),
      ]);

      invoicesList = repoInvoices.map((invoice) => ({
        id: invoice.id,
        appointment_id: invoice.appointment_id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        total_amount: Number(invoice.total_amount),
        remaining_amount: Number(invoice.remaining_amount),
        paid_at: invoice.paid_at,
        created_at: invoice.created_at,
      }));
      total = repoTotal;
    }

    return {
      data: invoicesList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancel(
    id: number,
    dto: CancelInvoiceDto,
    user: CurrentUserPayload,
  ): Promise<CancelInvoiceResponseDto> {
    if (user.rol !== 'RECEPCIONISTA' && user.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'Solo recepcionistas o administradores pueden anular facturas',
      );
    }

    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundBusinessException(
        'INVOICE_NOT_FOUND',
        'La factura ingresada no fue encontrada',
        { invoice_id: id },
      );
    }

    if (invoice.status === 'ANULADA') {
      throw new BadRequestBusinessException(
        'INVOICE_ALREADY_CANCELLED',
        'La factura ya se encuentra anulada',
        undefined,
        { invoice_id: id },
      );
    }

    if (invoice.status === 'PAGADA') {
      throw new BadRequestBusinessException(
        'INVOICE_ALREADY_PAID',
        'No se puede anular una factura pagada',
        undefined,
        { invoice_id: id },
      );
    }

    const updated = await this.invoiceRepository.update({
      id,
      status: 'ANULADA',
      cancellation_reason: dto.reason,
      cancelled_by_user_id: user.id,
      cancelled_at: new Date(),
    });

    return {
      id: updated.id,
      status: updated.status,
      cancellation_reason: dto.reason,
      cancelled_at: updated.cancelled_at ?? new Date(),
      message: 'La factura fue anulada correctamente',
    };
  }
}
