import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { RedisService } from '../../../common/redis/services/redis.service';

@Injectable()
export class AuthRedisService {
  constructor(private readonly redisService: RedisService) {}

  async saveVerificationCode(userId: number, code: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.set(`verification:${String(userId)}`, code, 'EX', 60 * 10);
  }

  async getVerificationCode(userId: number): Promise<string | null> {
    const client = this.redisService.getClient();
    return await client.get(`verification:${String(userId)}`);
  }

  async deleteVerificationCode(userId: number): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(`verification:${String(userId)}`);
  }

  // --- Refresh Token (opaque, rotación) ---

  async createRefreshToken(
    userId: number,
    ttlSeconds = 7 * 24 * 60 * 60,
  ): Promise<string> {
    const tokenId = randomUUID();
    const key = `refresh:${String(userId)}:${tokenId}`;
    const client = this.redisService.getClient();
    await client.set(key, '1', 'EX', ttlSeconds);
    return tokenId;
  }

  async validateRefreshToken(
    userId: number,
    tokenId: string,
  ): Promise<boolean> {
    const key = `refresh:${String(userId)}:${tokenId}`;
    const client = this.redisService.getClient();
    const value = await client.get(key);
    return value === '1';
  }

  async revokeRefreshToken(userId: number, tokenId: string): Promise<void> {
    const key = `refresh:${String(userId)}:${tokenId}`;
    const client = this.redisService.getClient();
    await client.del(key);
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    const pattern = `refresh:${String(userId)}:*`;
    const client = this.redisService.getClient();
    const stream = client.scanStream({ match: pattern, count: 100 });

    const keys: string[] = [];
    for await (const chunk of stream) {
      keys.push(...(chunk as string[]));
    }

    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
