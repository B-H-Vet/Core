import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EmailService } from '../../notifications/services/email.service';
import {
  IServiceRepository,
  SERVICE_REPOSITORY,
} from '../../services/repositories/service.repository.interface';
import { AppointmentDetailResponseDto } from '../dto/appointment-detail-response.dto';
import { AppointmentResponseDto } from '../dto/appointment-response.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
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

    private readonly emailService: EmailService,
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

  async create(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const appointmentDate = new Date(dto.date);

    if (appointmentDate <= new Date()) {
      throw new BadRequestException(
        'La fecha de la cita debe ser posterior a la fecha actual',
      );
    }

    const conflict = await this.appointmentRepository.findVetConflict(
      dto.vet_id,
      appointmentDate,
    );

    if (conflict) {
      throw new ConflictException(
        'El veterinario ya tiene una cita confirmada en ese horario',
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

    const total = services.reduce(
      (acc, service) => acc + Number(service.price),
      0,
    );

    if (total <= 0) {
      throw new BadRequestException(
        'El valor total de la cita debe ser mayor a cero',
      );
    }

    const appointment = await this.appointmentRepository.create({
      user_id: dto.user_id,
      vet_id: dto.vet_id,
      pet_id: dto.pet_id,
      date: appointmentDate,
    });

    await this.appointmentServiceRepository.createMany(
      services.map((service) => ({
        appointment_id: appointment.id,
        service_id: service.id,
        unit_price: service.price,
      })),
    );

    const emailInfo =
      await this.appointmentInfoRepository.getAppointmentEmailInfo({
        userId: appointment.user_id,
        petId: appointment.pet_id,
        vetId: appointment.vet_id,
      });

    if (!emailInfo) {
      throw new BadRequestException(
        'No se encontraron los datos necesarios para enviar la confirmación de la cita',
      );
    }

    await this.emailService.sendAppointmentConfirmation({
      to: emailInfo.clientEmail,
      petName: emailInfo.petName,
      vetName: emailInfo.vetName,
      appointmentDate: appointment.date,
      clinicAddress:
        process.env.CLINIC_ADDRESS ??
        'Sede principal Breaze & Harold Veterinary System',
    });

    return {
      id: appointment.id,
      user_id: appointment.user_id,
      vet_id: appointment.vet_id,
      pet_id: appointment.pet_id,
      date: appointment.date,
      status: appointment.status,
      total,
      created_at: appointment.created_at,
    };
  }

  async findAll(pagination: PaginationParams): Promise<{
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

    const [appointments, total] = await Promise.all([
      this.appointmentRepository.findAll({ page, limit }),
      this.appointmentRepository.count(),
    ]);

    const data = await Promise.all(
      appointments.map(async (appointment) => ({
        id: appointment.id,
        user_id: appointment.user_id,
        vet_id: appointment.vet_id,
        pet_id: appointment.pet_id,
        date: appointment.date,
        status: appointment.status,
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

  async findById(id: number): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

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
      status: appointment.status,
      cancel_reason: appointment.cancel_reason,
      canceled_at: appointment.canceled_at,
      rescheduled_at: appointment.rescheduled_at,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      total,
      services: appointmentServices,
    };
  }

  async complete(id: number): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('No se puede finalizar una cita cancelada');
    }

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('La cita ya se encuentra finalizada');
    }

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: 'COMPLETED',
    });

    return this.findById(updated.id);
  }

  async cancel(
    id: number,
    dto: CancelAppointmentDto,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException(
        'No se puede cancelar una cita ya finalizada',
      );
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('La cita ya se encuentra cancelada');
    }

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: 'CANCELLED',
      cancel_reason: dto.reason,
      canceled_at: new Date(),
    });

    return this.findById(updated.id);
  }

  async reschedule(
    id: number,
    dto: RescheduleAppointmentDto,
  ): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('La cita ingresada no fue encontrada');
    }

    if (appointment.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Solo se pueden reagendar citas confirmadas',
      );
    }

    const newDate = new Date(dto.date);

    if (newDate <= new Date()) {
      throw new BadRequestException(
        'La nueva fecha debe ser posterior a la fecha actual',
      );
    }

    const conflict = await this.appointmentRepository.findVetConflict(
      appointment.vet_id,
      newDate,
      id,
    );

    if (conflict) {
      throw new ConflictException(
        'El veterinario ya tiene una cita confirmada en ese horario',
      );
    }

    const updated = await this.appointmentRepository.updateStatus({
      id,
      status: 'CONFIRMED',
      date: newDate,
      rescheduled_at: new Date(),
    });

    return this.findById(updated.id);
  }

  async delete(id: number): Promise<{
    id: number;
    message: string;
    deleted_at: Date;
  }> {
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
