import { Module } from '@nestjs/common';
import { ClientsController } from './controllers/clients/clients.controller';
import { ClientsService } from './services/clients/clients.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService]
})
export class ClientsModule {}
