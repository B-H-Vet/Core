import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisService } from '../../../common/redis/services/redis.service';

export interface PendingAppointmentData {
  user_id: number;
  vet_id: number;
  pet_id: number;
  date: string;
  end_date: string;
  service_ids: number[];
  total: number;
  invoice_number: string;
  duration_minutes: number;
}

@Injectable()
export class AppointmentRedisService {
  private readonly client: Redis;
  private readonly ttlSeconds: number;

  get paymentTtlSeconds(): number {
    return this.ttlSeconds;
  }

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.client = this.redisService.getClient();
    this.ttlSeconds = Number(
      this.configService.get<string>('APPOINTMENT_PAYMENT_TTL') ?? '1800',
    );
  }

  async savePendingAppointment(
    token: string,
    data: PendingAppointmentData,
  ): Promise<void> {
    const key = `appointment:pending:${token}`;
    await this.client.set(key, JSON.stringify(data), 'EX', this.ttlSeconds);
  }

  async getPendingAppointment(
    token: string,
  ): Promise<PendingAppointmentData | null> {
    const key = `appointment:pending:${token}`;
    const raw = await this.client.get(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PendingAppointmentData;
  }

  async deletePendingAppointment(token: string): Promise<void> {
    const key = `appointment:pending:${token}`;
    await this.client.del(key);
  }
}
