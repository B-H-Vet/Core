import { Module } from '@nestjs/common';

import { ServicesController } from './controllers/services.controller';
import { ServiceRepository } from './repositories/service.repository';
import { SERVICE_REPOSITORY } from './repositories/service.repository.interface';
import { ServicesService } from './services/services.service';

@Module({
  imports: [],
  controllers: [ServicesController],
  providers: [
    ServicesService,
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
  ],
  exports: [ServicesService, SERVICE_REPOSITORY],
})
export class ServicesModule {}
