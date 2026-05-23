import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { MailModule } from '../../common/mail/mail.module';
import { RedisModule } from '../../common/redis/redis.module';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';
import { VetsModule } from '../vets/vets.module';

import { AuthController } from './controllers/auth.controller';
import { RegisterController } from './controllers/register.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthMailService } from './services/auth-mail.service';
import { AuthRedisService } from './services/auth-redis.service';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    UsersModule,
    MailModule,
    RedisModule,
    ClientsModule,
    VetsModule,
    ConfigModule,
  ],
  controllers: [AuthController, RegisterController],
  providers: [
    AuthService,
    AuthMailService,
    AuthRedisService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
