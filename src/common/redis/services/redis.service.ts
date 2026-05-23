import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  });

  async saveVerificationCode(userId: number, code: string): Promise<void> {
    await this.client.set(
      `verification:${String(userId)}`,
      code,
      'EX',
      60 * 10,
    );
  }

  async getVerificationCode(userId: number): Promise<string | null> {
    return await this.client.get(`verification:${String(userId)}`);
  }

  async deleteVerificationCode(userId: number): Promise<void> {
    await this.client.del(`verification:${String(userId)}`);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
