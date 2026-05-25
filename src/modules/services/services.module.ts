import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ServicesController } from './controllers/services.controller';
import { ServiceRepository } from './repositories/service.repository';
import { SERVICE_REPOSITORY } from './repositories/service.repository.interface';
import { ServicesAuditService } from './services/services-audit.service';
import { ServicesService } from './services/services.service';

@Module({
  imports: [ConfigModule],
  controllers: [ServicesController],
  providers: [
    ServicesService,
    ServicesAuditService,
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
  ],
  exports: [ServicesService, SERVICE_REPOSITORY],
})
export class ServicesModule {}
