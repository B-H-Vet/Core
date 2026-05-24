import { randomInt, randomUUID } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RolNombre } from '../../../database/schema/auth/roles.schema';
import { EmailService } from '../../notifications/services/email.service';
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
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { PendingAppointmentResponseDto } from '../dto/pending-appointment-response.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import {
  APPOINTMENT_INFO_REPOSITORY,
  IAppointmentInfoRepository,
} from '../repositories/appointment-info.repository.interface';
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

export interface CurrentUserPayload {
  id: number;
  email: string;
  rol: RolNombre;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: IAppointmentRepository,

    @Inject(APPOINTMENT_SERVICE_REPOSITORY)
    private readonly appointmentServiceRepository: IAppointmentServiceRepository,

    @Inject(APPOINTMENT_INFO_REPOSITORY)
    private readonly appointmentInfoRepository: IAppointmentInfoRepository,

    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,

    @Inject(VET_REPOSITORY)
    private readonly vetRepository: IVetRepository,

    private readonly emailService: EmailService,
    private readonly appointmentRedisService: AppointmentRedisService,
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
    appointment: { user_id: number; vet_id: number },
    user: CurrentUserPayload,
  ): Promise<void> {
    if (user.rol === 'ADMINISTRADOR' || user.rol === 'RECEPCIONISTA') {
      return;
    }

    if (user.rol === 'CLIENTE' && appointment.user_id !== user.id) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a esta cita',
      );
    }

    if (user.rol === 'VETERINARIO') {
      const vet = await this.vetRepository.findByUserId(user.id);
      if (vet?.id !== appointment.vet_id) {
        throw new ForbiddenException(
          'No tienes permisos para acceder a esta cita',
        );
      }
    }
  }

  private resolveClientUserId(
    dto: CreateAppointmentDto,
    user: CurrentUserPayload,
  ): number {
    if (user.rol === 'CLIENTE') {
      return user.id;
    }
    if (!dto.user_id) {
      throw new BadRequestException(
        'Debe proporcionar el user_id del cliente para agendar la cita',
      );
    }
    return dto.user_id;
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

  async create(
    dto: CreateAppointmentDto,
    user: CurrentUserPayload,
  ): Promise<PendingAppointmentResponseDto> {
    const clientUserId = this.resolveClientUserId(dto, user);
    const appointmentDate = new Date(dto.date);

    if (appointmentDate <= new Date()) {
      throw new BadRequestException(
        'La fecha de la cita debe ser posterior a la fecha actual',
      );
    }

    const services = await this.serviceRepository.findManyByIds(
      dto.service_ids,
    );

    if (services.length !== dto.service_ids.length) {
      throw new BadRequestException(
        'Uno o más servicios no existen o están inactivos',
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
      throw new BadRequestException(
        'El valor total de la cita debe ser mayor a cero',
      );
    }

    const conflict = await this.appointmentRepository.findVetConflict(
      dto.vet_id,
      appointmentDate,
      endDate,
    );

    if (conflict) {
      throw new ConflictException(
        'El veterinario ya tiene una cita agendada en ese horario',
      );
    }

    const token = randomUUID();
    const invoiceNumber = this.generateInvoiceNumber();

    const pendingData: PendingAppointmentData = {
      user_id: clientUserId,
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
        userId: clientUserId,
        petId: dto.pet_id,
        vetId: dto.vet_id,
      });

    if (!emailInfo) {
      throw new BadRequestException(
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
      throw new NotFoundException(
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
      throw new ConflictException(
        'El horario seleccionado ya no está disponible. Por favor, seleccione otro horario.',
      );
    }

    const services = await this.serviceRepository.findManyByIds(
      pendingData.service_ids,
    );

    if (services.length !== pendingData.service_ids.length) {
      throw new BadRequestException(
        'Uno o más servicios seleccionados ya no están disponibles.',
      );
    }

    const appointment = await this.appointmentRepository.create({
      user_id: pendingData.user_id,
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
        userId: appointment.user_id,
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
      user_id: appointment.user_id,
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
      [appointmentsList, total] = await Promise.all([
        this.appointmentRepository.findByClientUserId(user.id, { page, limit }),
        this.appointmentRepository.countByClientUserId(user.id),
      ]);
    } else if (user.rol === 'VETERINARIO') {
      const vet = await this.vetRepository.findByUserId(user.id);
      if (!vet) {
        throw new ForbiddenException('Veterinario no encontrado');
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
        user_id: appointment.user_id,
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
      throw new NotFoundException('La cita ingresada no fue encontrada');
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
      user_id: appointment.user_id,
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

  async complete(
    id: number,
    user: CurrentUserPayload,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

    await this.verifyOwnership(appointment, user);

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestException('No se puede finalizar una cita cancelada');
    }

    if (appointment.status === 'ATENDIDA') {
      throw new BadRequestException('La cita ya se encuentra finalizada');
    }

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
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

    await this.verifyOwnership(appointment, user);

    if (appointment.status === 'ATENDIDA') {
      throw new BadRequestException(
        'No se puede cancelar una cita ya finalizada',
      );
    }

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestException('La cita ya se encuentra cancelada');
    }

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: 'CANCELADA',
      cancel_reason: dto.reason,
      canceled_at: new Date(),
    });

    return this.findById(updated.id, user);
  }

  async reschedule(
    id: number,
    dto: RescheduleAppointmentDto,
    user: CurrentUserPayload,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

    await this.verifyOwnership(appointment, user);

    if (appointment.status === 'ATENDIDA') {
      throw new BadRequestException(
        'No se puede reagendar una cita ya finalizada',
      );
    }

    if (appointment.status === 'CANCELADA') {
      throw new BadRequestException('No se puede reagendar una cita cancelada');
    }

    const newDate = new Date(dto.date);

    if (newDate <= new Date()) {
      throw new BadRequestException(
        'La nueva fecha debe ser posterior a la fecha actual',
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
      throw new ConflictException(
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
      throw new ForbiddenException(
        'Solo un administrador puede eliminar citas',
      );
    }

    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
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
