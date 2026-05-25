import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from 'axios';
import type { AxiosInstance } from 'axios';

@Injectable()
export class ServicesAuditService {
  private readonly client: AxiosInstance;
  private readonly logger = new Logger(ServicesAuditService.name);

  constructor(private readonly configService: ConfigService) {
    const baseURL =
      this.configService.get<string>('AUDIT_SERVICE_URL') ??
      'http://localhost:8080';
    this.client = create({
      baseURL,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async serviceCreated(data: {
    serviceId: string;
    price: number;
    serviceCreatorId: string;
    serviceCreatorRole: string;
  }): Promise<void> {
    await this.post('/details/service-created', {
      occurredAt: new Date().toISOString(),
      ...data,
    });
  }

  async serviceEdited(data: {
    serviceId: string;
    serviceEditorId: string;
    serviceEditorRole: string;
  }): Promise<void> {
    await this.post('/details/service-edited', {
      occurredAt: new Date().toISOString(),
      ...data,
    });
  }

  async serviceDeactivated(data: {
    serviceId: string;
    serviceDeactivatorId: string;
    serviceDeactivatorRole: string;
  }): Promise<void> {
    await this.post('/details/service-deactivated', {
      occurredAt: new Date().toISOString(),
      ...data,
    });
  }

  private async post(path: string, payload: unknown): Promise<void> {
    try {
      await this.client.post(path, payload);
    } catch (error) {
      this.logger.error(`Audit request failed: ${path}`, error);
    }
  }
}
