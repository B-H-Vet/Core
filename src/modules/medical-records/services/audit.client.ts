import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuditClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = process.env.AUDIT_SERVICE_URL ?? '';
  }

  async medicalRecordCreated(payload: {
    occurredAt: string;
    medicalRecordId: string;
    medicalRecordCreatorId: string;
    medicalRecordCreatorRole: string;
    medicalRecordCreatorName: string;
    ip: string;
    userAgent: string;
  }) {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/details/medical-record-created`, payload),
    );
  }

  async medicalRecordEdited(payload: {
    occurredAt: string;
    medicalRecordId: string;
    medicalRecordEditorId: string;
    medicalRecordEditorRole: string;
    medicalRecordEditorName: string;
    ip: string;
    userAgent: string;
  }) {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/details/medical-record-edited`, payload),
    );
  }
}
