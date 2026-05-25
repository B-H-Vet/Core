import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuditService {
  private readonly client = axios;
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly configService: ConfigService) {
    const baseURL =
      this.configService.get<string>('AUDIT_SERVICE_URL') ??
      'http://localhost:8080';

    this.client.defaults.baseURL = baseURL;
    this.client.defaults.timeout = 5000;
    this.client.defaults.headers.common['Content-Type'] = 'application/json';
  }

  async userRegistered(data: {
    newUserId: string;
    newUserName: string;
    assignedRole: string;
    email: string;
  }): Promise<void> {
    await this.post('/details/user-registered', data);
  }

  async emailVerified(data: {
    userId: string;
    userRole: string;
    emailSnapshot: string;
  }): Promise<void> {
    await this.post('/details/email-verified', data);
  }

  async loginSuccess(data: {
    userId: string;
    loggedUserName: string;
    emailSnapshot: string;
    ip: string;
    userAgent?: string | undefined;
    loggedUserRole: string;
  }): Promise<void> {
    await this.post('/details/login-success', data);
  }

  async loginFailed(data: {
    userId?: string | undefined;
    userName?: string | undefined;
    userRole?: string | undefined;
    ip: string;
    userAgent?: string | undefined;
    failureReason: string;
  }): Promise<void> {
    await this.post('/details/login-failed', data);
  }

  private async post(path: string, payload: unknown): Promise<void> {
    try {
      await this.client.post(path, payload);
    } catch (error) {
      this.logger.error(`Audit request failed: ${path}`, error);
    }
  }
}
