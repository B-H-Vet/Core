import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AppointmentAuditService {
  private readonly client = axios;
  private readonly logger = new Logger(AppointmentAuditService.name);

  constructor(private readonly configService: ConfigService) {
    const baseURL =
      this.configService.get<string>('AUDIT_SERVICE_URL') ??
      'http://localhost:8080';

    this.client.defaults.baseURL = baseURL;
    this.client.defaults.timeout = 5000;
    this.client.defaults.headers.common['Content-Type'] = 'application/json';
  }

  async appointmentCreated(data: {
    appointmentId: string;
    scheduledAt: string;
    appointmentCreatorId: string;
    appointmentCreatorRole: string;
  }): Promise<void> {
    await this.post('/details/appointment-created', data);
  }

  async appointmentPayment(data: {
    appointmentId: string;
    appointmentPayerId: string;
    appointmentPayerRole: string;
  }): Promise<void> {
    await this.post('/details/appointment-payment', data);
  }

  async appointmentAttended(data: {
    appointmentId: string;
    appointmentAttenderId: string;
    appointmentAttenderRole: string;
  }): Promise<void> {
    await this.post('/details/appointment-attended', data);
  }

  async appointmentCancelled(data: {
    appointmentId: string;
    appointmentCancellerId: string;
    appointmentCancellerRole: string;
  }): Promise<void> {
    await this.post('/details/appointment-cancelled', data);
  }

  private async post(
    path: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.client.post(path, {
        occurredAt: new Date().toISOString(),
        ...payload,
      });
    } catch (error) {
      this.logger.error(`Audit request failed: ${path}`, error);
    }
  }
}
