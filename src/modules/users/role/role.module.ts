import { Module } from '@nestjs/common';

import { UserRoleModule } from '../user-role/user-role.module';

import { AdminController } from './controllers/admin.controller';
import { RoleRepository } from './repositories/role.repository';
import { ROLE_REPOSITORY } from './repositories/role.repository.interface';
import { RoleService } from './services/role.service';
import { ROLE_SERVICE } from './services/role.service.interface';

@Module({
  imports: [UserRoleModule],
  controllers: [AdminController],
  providers: [
    RoleService,
    {
      provide: ROLE_SERVICE,
      useExisting: RoleService,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
  ],
  exports: [RoleService, ROLE_SERVICE, ROLE_REPOSITORY],
})
export class RoleModule {}
