import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisService } from '../../../common/redis/services/redis.service';

export interface InvoicePaymentData {
  invoice_id: number;
  client_id: number;
}

@Injectable()
export class InvoiceRedisService {
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
      this.configService.get<string>('INVOICE_PAYMENT_TTL') ?? '1800',
    );
  }

  async savePaymentToken(
    token: string,
    data: InvoicePaymentData,
  ): Promise<void> {
    const key = `invoice:payment:${token}`;
    await this.client.set(key, JSON.stringify(data), 'EX', this.ttlSeconds);
  }

  async getPaymentToken(token: string): Promise<InvoicePaymentData | null> {
    const key = `invoice:payment:${token}`;
    const raw = await this.client.get(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as InvoicePaymentData;
  }

  async deletePaymentToken(token: string): Promise<void> {
    const key = `invoice:payment:${token}`;
    await this.client.del(key);
  }
}
