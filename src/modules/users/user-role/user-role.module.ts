import { Module } from '@nestjs/common';

import { UserRoleRepository } from './repositories/user-role.repository';
import { USER_ROLE_REPOSITORY } from './repositories/user-role.repository.interface';
import { UserRoleService } from './services/user-role.service';
import { USER_ROLE_SERVICE } from './services/user-role.service.interface';

@Module({
  providers: [
    UserRoleService,
    {
      provide: USER_ROLE_SERVICE,
      useExisting: UserRoleService,
    },
    {
      provide: USER_ROLE_REPOSITORY,
      useClass: UserRoleRepository,
    },
  ],
  exports: [UserRoleService, USER_ROLE_SERVICE, USER_ROLE_REPOSITORY],
})
export class UserRoleModule {}
