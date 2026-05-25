import { randomInt, randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import {
  BadRequestBusinessException,
  ConflictBusinessException,
  ForbiddenBusinessException,
  NotFoundBusinessException,
} from '../../../common/exceptions';
import { CurrentUserPayload } from '../../../common/types/current-user.type';
import { CreateMedicalRecordDto } from '../../medical-records/dto/create-medical-record.dto';
import { MedicalRecordsService } from '../../medical-records/services/medical-records.service';
import { EmailService } from '../../notifications/services/email.service';
import {
  IPetRepository,
  PET_REPOSITORY,
} from '../../pets/repositories/pet.repository.interface';
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '../../services/repositories/service.repository.interface';
import {
  IVetRepository,
  VET_REPOSITORY,
} from '../../vets/vet/repositories/vet.repository.interface';
import { AppointmentDetailResponseDto } from '../dto/appointment-detail-response.dto';
import { AppointmentResponseDto } from '../dto/appointment-response.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { CompleteAppointmentDto } from '../dto/complete-appointment.dto';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { PendingAppointmentResponseDto } from '../dto/pending-appointment-response.dto';
import { PendingInvoiceAppointmentResponseDto } from '../dto/pending-invoice-appointment-response.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import {
  APPOINTMENT_INFO_REPOSITORY,
  IAppointmentInfoRepository,
} from '../repositories/appointment-info.repository.interface';
import {
  APPOINTMENT_INVOICE_QUERY_REPOSITORY,
  IAppointmentInvoiceQueryRepository,
} from '../repositories/appointment-invoice-query.repository.interface';
import {
  APPOINTMENT_SERVICE_REPOSITORY,
  IAppointmentServiceRepository,
} from '../repositories/appointment-service.repository.interface';
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
  PaginationParams,
} from '../repositories/appointment.repository.interface';

import {
  AppointmentRedisService,
  PendingAppointmentData,
} from './appointment-redis.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject(APPOINTMENT_SERVICE_REPOSITORY)
    private readonly appointmentServiceRepository: IAppointmentServiceRepository,

    @Inject(APPOINTMENT_INFO_REPOSITORY)
    private readonly appointmentInfoRepository: IAppointmentInfoRepository,

    @Inject(APPOINTMENT_INVOICE_QUERY_REPOSITORY)
    private readonly appointmentInvoiceQueryRepository: IAppointmentInvoiceQueryRepository,

    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    @Inject(PET_REPOSITORY)
    private readonly petRepository: IPetRepository,

    private readonly emailService: EmailService,
    private readonly appointmentRedisService: AppointmentRedisService,

    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  private async getAppointmentTotal(appointmentId: number): Promise<number> {
    const appointmentServices =
      await this.appointmentServiceRepository.findByAppointmentId(
        appointmentId,
      );

    return appointmentServices.reduce(
      (acc, item) => acc + Number(item.unit_price),
      0,
    );
  }

  private async getAppointmentDurationMinutes(
    appointmentId: number,
  ): Promise<number> {
    const appointmentServices =
      await this.appointmentServiceRepository.findByAppointmentId(
        appointmentId,
      );

    return appointmentServices.reduce(
      (acc, item) => acc + item.duration_minutes,
      0,
    );
  }

  private async verifyOwnership(
    appointment: { client_id: number; vet_id: number },
    user: CurrentUserPayload,
  ): Promise<void> {
    if (user.rol === 'ADMINISTRADOR' || user.rol === 'RECEPCIONISTA') {
      return;
    }

    if (user.rol === 'CLIENTE' && appointment.client_id !== user.profileId) {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'No tienes permisos para acceder a esta cita',
      );
    }

    if (user.rol === 'VETERINARIO') {
      const vet = await this.vetRepository.findByUserId(user.id);
      if (vet?.id !== appointment.vet_id) {
        throw new ForbiddenBusinessException(
          'FORBIDDEN_RESOURCE',
          'No tienes permisos para acceder a esta cita',
        );
      }
    }
  }

  private resolveClientId(
    dto: CreateAppointmentDto,
    user: CurrentUserPayload,
  ): number {
    if (user.rol === 'CLIENTE') {
      if (!user.profileId) {
        throw new ForbiddenBusinessException(
          'CLIENT_PROFILE_MISSING',
          'No tienes un perfil de cliente asociado',
        );
      }
      return user.profileId;
    }
    if (!dto.client_id) {
      throw new BadRequestBusinessException(
        'MISSING_CLIENT_ID',
        'Debe proporcionar el client_id del cliente para agendar la cita',
        [{ field: 'client_id', message: 'El campo es requerido' }],
      );
    }
    return dto.client_id;
  }

  private buildConfirmLink(token: string): string {
    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    return `${baseUrl}/appointments/confirm/${token}`;
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = randomInt(0, 10000).toString().padStart(4, '0');
    return `CITA-${String(timestamp)}-${random}`;
  }

  private computeEndDate(startDate: Date, durationMinutes: number): Date {
    const end = new Date(startDate);
    end.setMinutes(end.getMinutes() + durationMinutes);
    return end;
  }

  private isWithinBusinessHours(date: Date): boolean {
    const businessDays = process.env.BUSINESS_DAYS?.split(',').map(Number) ?? [
      1, 2, 3, 4, 5,
    ];
    const startHour = Number(process.env.BUSINESS_HOURS_START ?? '7');
    const endHour = Number(process.env.BUSINESS_HOURS_END ?? '19');

    const day = date.getDay();
    const hour = date.getHours();

    return businessDays.includes(day) && hour >= startHour && hour < endHour;
  }

  async create(
    dto: CreateAppointmentDto,
    user: CurrentUserPayload,
  ): Promise<PendingAppointmentResponseDto> {
    const clientId = this.resolveClientId(dto, user);
    const appointmentDate = new Date(dto.date);

    if (appointmentDate <= new Date()) {
      throw new BadRequestBusinessException(
        'INVALID_APPOINTMENT_DATE',
        'La fecha de la cita debe ser posterior a la fecha actual',
        [{ field: 'date', message: 'La fecha debe ser posterior a la actual' }],
      );
    }

    if (!this.isWithinBusinessHours(appointmentDate)) {
      throw new BadRequestBusinessException(
        'OUTSIDE_BUSINESS_HOURS',
        'La cita debe agendarse dentro del horario de atención (Lunes a Viernes, 7:00 a.m. – 7:00 p.m.)',
        [
          {
            field: 'date',
            message:
              'Horario fuera de la ventana de atención (Lunes a Viernes, 7:00 a.m. – 7:00 p.m.)',
          },
        ],
      );
    }

    const pet = await this.petRepository.findById(dto.pet_id);

    if (!pet) {
      throw new NotFoundBusinessException(
        'PET_NOT_FOUND',
        'La mascota ingresada no fue encontrada',
        { pet_id: dto.pet_id },
      );
    }

    if (pet.client.id !== clientId) {
      throw new ForbiddenBusinessException(
        'PET_NOT_BELONGS_TO_CLIENT',
        'La mascota no pertenece al cliente seleccionado',
      );
    }

    const services = await this.serviceRepository.findManyByIds(
      dto.service_ids,
    );

    if (services.length !== dto.service_ids.length) {
      throw new BadRequestBusinessException(
        'SERVICES_NOT_FOUND',
        'Uno o más servicios no existen o están inactivos',
        [{ field: 'service_ids', message: 'Uno o más servicios no existen' }],
      );
    }

    const totalDurationMinutes = services.reduce(
      (acc, s) => acc + s.duration_minutes,
      0,
    );
    const endDate = this.computeEndDate(appointmentDate, totalDurationMinutes);

    const total = services.reduce(
      (acc, service) => acc + Number(service.price),
      0,
    );

    if (total <= 0) {
      throw new BadRequestBusinessException(
        'INVALID_TOTAL_AMOUNT',
        'El valor total de la cita debe ser mayor a cero',
      );
    }

    const conflict = await this.appointmentRepository.findVetConflict(
      dto.vet_id,
      appointmentDate,
      endDate,
    );

    if (conflict) {
      throw new ConflictBusinessException(
        'APPOINTMENT_CONFLICT',
        'El veterinario ya tiene una cita agendada en ese horario',
      );
    }

    const token = randomUUID();
    const invoiceNumber = this.generateInvoiceNumber();

    const pendingData: PendingAppointmentData = {
      client_id: clientId,
      vet_id: dto.vet_id,
      pet_id: dto.pet_id,
      date: appointmentDate.toISOString(),
      end_date: endDate.toISOString(),
      service_ids: dto.service_ids,
      total,
      invoice_number: invoiceNumber,
      duration_minutes: totalDurationMinutes,
    };

    await this.appointmentRedisService.savePendingAppointment(
      token,
      pendingData,
    );

    const emailInfo =
      await this.appointmentInfoRepository.getAppointmentEmailInfo({
        clientId: clientId,
        petId: dto.pet_id,
        vetId: dto.vet_id,
      });

    if (!emailInfo) {
      throw new BadRequestBusinessException(
        'MISSING_CONFIRMATION_DATA',
        'No se encontraron los datos necesarios para enviar la confirmación de la cita',
      );
    }

    const clinicAddress =
      process.env.CLINIC_ADDRESS ??
      'Sede principal Breaze & Harold Veterinary System';

    const confirmLink = this.buildConfirmLink(token);

    const invoicePdfBuffer = await this.emailService.generateInvoicePdf({
      invoiceNumber,
      issueDate: new Date(),
      clientName: emailInfo.clientName,
      clientEmail: emailInfo.clientEmail,
      clientPhone: emailInfo.clientPhone ?? undefined,
      petName: emailInfo.petName,
      vetName: emailInfo.vetName,
      appointmentDate,
      clinicAddress,
      services: services.map((s) => ({
        name: s.name,
        description: s.description ?? '',
        unitPrice: Number(s.price),
        durationMinutes: s.duration_minutes,
      })),
      total,
      paymentLink: confirmLink,
    });

    await this.emailService.sendAppointmentConfirmation({
      to: emailInfo.clientEmail,
      petName: emailInfo.petName,
      vetName: emailInfo.vetName,
      appointmentDate,
      clinicAddress,
      invoicePdfBuffer,
      invoiceFileName: `Factura-${invoiceNumber}.pdf`,
      paymentLink: confirmLink,
      services: services.map((s) => ({
        name: s.name,
        unitPrice: Number(s.price),
        durationMinutes: s.duration_minutes,
      })),
      total,
      paymentExpirationMinutes: Math.ceil(
        this.appointmentRedisService.paymentTtlSeconds / 60,
      ),
    });

    return {
      token,
      invoice_number: invoiceNumber,
      status: 'PENDIENTE_PAGO',
      message:
        'Se ha enviado un correo con la factura y el enlace de pago. La cita será confirmada una vez se procese el pago.',
    };
  }

  async confirm(token: string): Promise<AppointmentResponseDto> {
    const pendingData =
      await this.appointmentRedisService.getPendingAppointment(token);

    if (!pendingData) {
      throw new NotFoundBusinessException(
        'TOKEN_NOT_FOUND',
        'El token de confirmación ha expirado o no es válido. Por favor, solicite una nueva cita.',
      );
    }

    const appointmentDate = new Date(pendingData.date);
    const endDate = new Date(pendingData.end_date);

    const conflict = await this.appointmentRepository.findVetConflict(
      pendingData.vet_id,
      appointmentDate,
      endDate,
    );

    if (conflict) {
      throw new ConflictBusinessException(
        'APPOINTMENT_CONFLICT',
        'El horario seleccionado ya no está disponible porque fue confirmado por otro pago. Por favor, seleccione otro horario.',
      );
    }

    const services = await this.serviceRepository.findManyByIds(
      pendingData.service_ids,
    );

    if (services.length !== pendingData.service_ids.length) {
      throw new BadRequestBusinessException(
        'SERVICES_NOT_FOUND',
        'Uno o más servicios seleccionados ya no están disponibles.',
        [{ field: 'service_ids', message: 'Servicios no disponibles' }],
      );
    }

    const appointment = await this.appointmentRepository.create({
      client_id: pendingData.client_id,
      vet_id: pendingData.vet_id,
      pet_id: pendingData.pet_id,
      date: appointmentDate,
      end_date: endDate,
      invoice_number: pendingData.invoice_number,
      paid_at: new Date(),
    });

    await this.appointmentServiceRepository.createMany(
      services.map((service) => ({
        appointment_id: appointment.id,
        service_id: service.id,
        unit_price: service.price,
      })),
    );

    await this.appointmentRedisService.deletePendingAppointment(token);

    const emailInfo =
      await this.appointmentInfoRepository.getAppointmentEmailInfo({
        clientId: appointment.client_id,
        petId: appointment.pet_id,
        vetId: appointment.vet_id,
      });

    if (emailInfo) {
      await this.emailService.sendPaymentConfirmation({
        to: emailInfo.clientEmail,
        petName: emailInfo.petName,
        vetName: emailInfo.vetName,
        appointmentDate: appointment.date,
        clinicAddress:
          process.env.CLINIC_ADDRESS ??
          'Sede principal Breaze & Harold Veterinary System',
        total: pendingData.total,
      });
    }

    const total = await this.getAppointmentTotal(appointment.id);

    return {
      id: appointment.id,
      client_id: appointment.client_id,
      vet_id: appointment.vet_id,
      pet_id: appointment.pet_id,
      date: appointment.date,
      end_date: appointment.end_date,
      status: appointment.status,
      invoice_number: appointment.invoice_number,
      paid_at: appointment.paid_at,
      total,
      created_at: appointment.created_at,
    };
  }

  async findAll(
    pagination: PaginationParams,
    user: CurrentUserPayload,
  ): Promise<{
    data: AppointmentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    let appointmentsList: Awaited<
      ReturnType<IAppointmentRepository['findAll']>
    >;
    let total: number;

    if (user.rol === 'CLIENTE') {
      if (!user.profileId) {
        throw new ForbiddenBusinessException(
          'CLIENT_PROFILE_MISSING',
          'No tienes un perfil de cliente asociado',
        );
      }
      [appointmentsList, total] = await Promise.all([
        this.appointmentRepository.findByClientId(user.profileId, {
          page,
          limit,
        }),
        this.appointmentRepository.countByClientId(user.profileId),
      ]);
    } else if (user.rol === 'VETERINARIO') {
      const vet = await this.vetRepository.findByUserId(user.id);
      if (!vet) {
        throw new ForbiddenBusinessException(
          'VET_NOT_FOUND',
          'Veterinario no encontrado',
        );
      }
      [appointmentsList, total] = await Promise.all([
        this.appointmentRepository.findByVetId(vet.id, { page, limit }),
        this.appointmentRepository.countByVetId(vet.id),
      ]);
    } else {
      [appointmentsList, total] = await Promise.all([
        this.appointmentRepository.findAll({ page, limit }),
        this.appointmentRepository.count(),
      ]);
    }

    const data = await Promise.all(
      appointmentsList.map(async (appointment) => ({
        id: appointment.id,
        client_id: appointment.client_id,
        vet_id: appointment.vet_id,
        pet_id: appointment.pet_id,
        date: appointment.date,
        end_date: appointment.end_date,
        status: appointment.status,
        invoice_number: appointment.invoice_number,
        paid_at: appointment.paid_at,
        total: await this.getAppointmentTotal(appointment.id),
        created_at: appointment.created_at,
      })),
    );

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(
    id: number,
    user: CurrentUserPayload,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundBusinessException(
        'APPOINTMENT_NOT_FOUND',
        'La cita ingresada no fue encontrada',
        { appointment_id: id },
      );
    }

    await this.verifyOwnership(appointment, user);

    const appointmentServices =
      await this.appointmentServiceRepository.findByAppointmentId(id);

    const total = appointmentServices.reduce(
      (acc, item) => acc + Number(item.unit_price),
      0,
    );

    return {
      id: appointment.id,
      client_id: appointment.client_id,
      vet_id: appointment.vet_id,
      pet_id: appointment.pet_id,
      date: appointment.date,
      end_date: appointment.end_date,
      status: appointment.status,
      invoice_number: appointment.invoice_number,
      paid_at: appointment.paid_at,
      cancel_reason: appointment.cancel_reason,
      canceled_at: appointment.canceled_at,
      rescheduled_at: appointment.rescheduled_at,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      total,
      services: appointmentServices,
    };
  }

  async findPendingInvoice(pagination: PaginationParams): Promise<{
    data: PendingInvoiceAppointmentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    const [rows, total] = await Promise.all([
      this.appointmentInvoiceQueryRepository.findPendingInvoice({
        page,
        limit,
      }),
      this.appointmentInvoiceQueryRepository.countPendingInvoice(),
    ]);

    const data = rows.map((row) => ({
      id: row.id,
      date: row.date,
      end_date: row.end_date,
      client_name: row.client_name,
      pet_name: row.pet_name,
      vet_name: row.vet_name,
      service_total: row.service_total,
      has_prescribed_medicines: row.has_prescribed_medicines,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async complete(
    id: number,
    user: CurrentUserPayload,
    dto: CompleteAppointmentDto,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundBusinessException(
        'APPOINTMENT_NOT_FOUND',
        'La cita ingresada no fue encontrada',
        { appointment_id: id },
      );
    }

    await this.verifyOwnership(appointment, user);

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_CANCELLED',
        'No se puede finalizar una cita cancelada',
      );
    }

    if (appointment.status === 'ATENDIDA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_COMPLETED',
        'La cita ya se encuentra finalizada',
      );
    }

    const medicalRecordDto: CreateMedicalRecordDto = {
      appointment_id: id,
      visit_reason: dto.visit_reason ?? '',
      diagnosis: dto.diagnosis ?? '',
      treatment: dto.treatment ?? '',
      weight_at_visit: dto.weight_at_visit,
      ...(dto.next_visit_date !== undefined && {
        next_visit_date: dto.next_visit_date,
      }),
      ...(dto.medicines !== undefined && { medicines: dto.medicines }),
      ...(dto.vaccines !== undefined && { vaccines: dto.vaccines }),
    };

    await this.medicalRecordsService.create(medicalRecordDto);

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: 'ATENDIDA',
    });

    return this.findById(updated.id, user);
  }

  async cancel(
    id: number,
    dto: CancelAppointmentDto,
    user: CurrentUserPayload,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundBusinessException(
        'APPOINTMENT_NOT_FOUND',
        'La cita ingresada no fue encontrada',
        { appointment_id: id },
      );
    }

    await this.verifyOwnership(appointment, user);

    if (appointment.status === 'ATENDIDA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_COMPLETED',
        'No se puede cancelar una cita ya finalizada',
      );
    }

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_CANCELLED',
        'La cita ya se encuentra cancelada',
      );
    }

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: 'CANCELADA',
      cancel_reason: dto.reason,
      canceled_at: new Date(),
    });

    const cancelEmailInfo =
      await this.appointmentInfoRepository.getAppointmentEmailInfo({
        clientId: appointment.client_id,
        petId: appointment.pet_id,
        vetId: appointment.vet_id,
      });

    if (cancelEmailInfo) {
      await this.emailService.sendCancellationNotification({
        to: cancelEmailInfo.clientEmail,
        petName: cancelEmailInfo.petName,
        vetName: cancelEmailInfo.vetName,
        appointmentDate: appointment.date,
        clinicAddress:
          process.env.CLINIC_ADDRESS ??
          'Sede principal Breaze & Harold Veterinary System',
        cancelReason: dto.reason,
      });
    }

    return this.findById(updated.id, user);
  }

  async reschedule(
    id: number,
    dto: RescheduleAppointmentDto,
    user: CurrentUserPayload,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundBusinessException(
        'APPOINTMENT_NOT_FOUND',
        'La cita ingresada no fue encontrada',
        { appointment_id: id },
      );
    }

    await this.verifyOwnership(appointment, user);

    if (appointment.status === 'ATENDIDA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_COMPLETED',
        'No se puede reagendar una cita ya finalizada',
      );
    }

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestBusinessException(
        'APPOINTMENT_ALREADY_CANCELLED',
        'No se puede reagendar una cita cancelada',
      );
    }

    const newDate = new Date(dto.date);

    if (newDate <= new Date()) {
      throw new BadRequestBusinessException(
        'INVALID_RESCHEDULE_DATE',
        'La nueva fecha debe ser posterior a la fecha actual',
        [
          {
            field: 'date',
            message: 'La nueva fecha debe ser posterior a la actual',
          },
        ],
      );
    }

    if (!this.isWithinBusinessHours(newDate)) {
      throw new BadRequestBusinessException(
        'OUTSIDE_BUSINESS_HOURS',
        'La cita debe reagendarse dentro del horario de atención (Lunes a Viernes, 7:00 a.m. – 7:00 p.m.)',
        [
          {
            field: 'date',
            message:
              'Horario fuera de la ventana de atención (Lunes a Viernes, 7:00 a.m. – 7:00 p.m.)',
          },
        ],
      );
    }

    const durationMinutes = await this.getAppointmentDurationMinutes(id);
    const newEndDate = this.computeEndDate(newDate, durationMinutes);

    const conflict = await this.appointmentRepository.findVetConflict(
      appointment.vet_id,
      newDate,
      newEndDate,
      id,
    );

    if (conflict) {
      throw new ConflictBusinessException(
        'APPOINTMENT_CONFLICT',
        'El veterinario ya tiene una cita agendada en ese horario',
      );
    }

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: appointment.status,
      date: newDate,
      end_date: newEndDate,
      rescheduled_at: new Date(),
    });

    return this.findById(updated.id, user);
  }

  async delete(
    id: number,
    user: CurrentUserPayload,
  ): Promise<{
    id: number;
    message: string;
    deleted_at: Date;
  }> {
    if (user.rol !== 'ADMINISTRADOR') {
      throw new ForbiddenBusinessException(
        'FORBIDDEN_RESOURCE',
        'Solo un administrador puede eliminar citas',
      );
    }

    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundBusinessException(
        'APPOINTMENT_NOT_FOUND',
        'La cita ingresada no fue encontrada',
        { appointment_id: id },
      );
    }

    await this.appointmentServiceRepository.softDeleteByAppointmentId(id);
    await this.appointmentRepository.softDelete(id);

    return {
      id,
      message: 'La cita fue eliminada correctamente',
      deleted_at: new Date(),
    };
  }
}
