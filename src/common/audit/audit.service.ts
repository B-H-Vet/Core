import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// DTOs

export interface LoginSuccessDto {
  loggedUserName: string;
  userId: string;
  loggedUserRole: string;
  emailSnapshot: string;
}

export interface LoginFailedDto {
  failureReason: string;
  terminalIp: string;
  userAgent: string;
}

export interface UserRegisteredDto {
  assignedRole: string;
  email: string;
  newUserId: string;
}

export interface EmailVerifiedDto {
  userId: string;
  userName: string;
  userRole: string;
}

export interface AccountApprovedDto {
  approverName: string;
  approverId: string;
  approvedUserId: string;
  approverRole: string;
}

export interface AccountRejectedDto {
  rejecterRole: string;
  rejecterName: string;
  rejectedUserId: string;
  rejecterId: string;
}

export interface UserSuspendedDto {
  suspenderName: string;
  suspenderRole: string;
  suspenderId: string;
  suspendedUserId: string;
}

export interface InvoiceCreatedDto {
  ip: string;
  invoiceId: string;
  userAgent: string;
  subtotal: number;
  total: number;
  invoiceCreatorId: string;
  invoiceCreatorName: string;
  invoiceCreatorRole: string;
}

export interface InvoiceVoidedDto {
  ip: string;
  invoiceVoiderName: string;
  voidReason: string;
  invoiceVoiderRole: string;
  invoiceVoiderId: string;
  invoiceId: string;
  userAgent: string;
  occurredAt: string;
}

export interface AppointmentCreatedDto {
  occurredAt: string;
  appointmentId: string;
  scheduledAt: string;
  appointmentCreatorId: string;
  appointmentCreatorRole: string;
}

export interface AppointmentAttendedDto {
  occurredAt: string;
  appointmentId: string;
  appointmentAttenderId: string;
  appointmentAttenderRole: string;
}

export interface AppointmentCancelledDto {
  occurredAt: string;
  appointmentId: string;
  cancellationReason: string;
  appointmentCancellerId: string;
  appointmentCancellerRole: string;
}

export interface AppointmentPaymentDto {
  occurredAt: string;
  appointmentId: string;
  amount: number;
  appointmentPayerId: string;
  appointmentPayerRole: string;
}

export interface MedicalRecordCreatedDto {
  medicalRecordId: string;
  medicalRecordCreatorId: string;
  medicalRecordCreatorRole: string;
  medicalRecordCreatorName: string;
  ip: string;
  userAgent: string;
  occurredAt: string;
}

export interface MedicalRecordEditedDto {
  medicalRecordId: string;
  medicalRecordCreatorId: string;
  medicalRecordCreatorRole: string;
  medicalRecordCreatorName: string;
  ip: string;
  userAgent: string;
  occurredAt: string;
}

// Servicio

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly auditUrl: string;

  constructor(private readonly config: ConfigService) {
    this.auditUrl =
      this.config.get<string>('AUDIT_URL') ?? 'http://localhost:8080';
  }

  private async post(endpoint: string, body: object): Promise<void> {
    try {
      await fetch(`${this.auditUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.warn(`Audit log failed [${endpoint}]: ${String(error)}`);
    }
  }

  // Auth

  logLoginSuccess(dto: LoginSuccessDto): void {
    void this.post('/details/login-success', dto);
  }

  logLoginFailed(dto: LoginFailedDto): void {
    void this.post('/details/login-failed', dto);
  }

  // Usuarios

  logUserRegistered(dto: UserRegisteredDto): void {
    void this.post('/details/user-registered', dto);
  }

  logEmailVerified(dto: EmailVerifiedDto): void {
    void this.post('/details/email-verified', dto);
  }

  logAccountApproved(dto: AccountApprovedDto): void {
    void this.post('/details/account-approved', dto);
  }

  logAccountRejected(dto: AccountRejectedDto): void {
    void this.post('/details/account-rejected', dto);
  }

  logUserSuspended(dto: UserSuspendedDto): void {
    void this.post('/details/user-suspended', dto);
  }

  // Facturas

  logInvoiceCreated(dto: InvoiceCreatedDto): void {
    void this.post('/details/invoice-created', dto);
  }

  logInvoiceVoided(dto: InvoiceVoidedDto): void {
    void this.post('/details/invoice-voided', dto);
  }

  // Citas

  logAppointmentCreated(dto: AppointmentCreatedDto): void {
    void this.post('/details/appointment-created', dto);
  }

  logAppointmentAttended(dto: AppointmentAttendedDto): void {
    void this.post('/details/appointment-attended', dto);
  }

  logAppointmentCancelled(dto: AppointmentCancelledDto): void {
    void this.post('/details/appointment-cancelled', dto);
  }

  logAppointmentPayment(dto: AppointmentPaymentDto): void {
    void this.post('/details/appointment-payment', dto);
  }

  // Historia clínica

  logMedicalRecordCreated(dto: MedicalRecordCreatedDto): void {
    void this.post('/details/medical-record-created', dto);
  }

  logMedicalRecordEdited(dto: MedicalRecordEditedDto): void {
    void this.post('/details/medical-record-edited', dto);
  }
}
