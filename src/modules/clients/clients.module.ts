import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { ClientsController } from './controllers/clients.controller';
import { ClientRepository } from './repositories/client.repository';
import { CLIENT_REPOSITORY } from './repositories/client.repository.interface';
import { ClientsService } from './services/clients.service';

@Module({
  imports: [UsersModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientRepository,
    },
  ],
  exports: [ClientsService, CLIENT_REPOSITORY],
})
export class ClientsModule {}
