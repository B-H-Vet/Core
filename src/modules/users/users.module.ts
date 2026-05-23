import { Module } from '@nestjs/common';

import { AdminController } from './role/controllers/admin.controller';
import { UsersController } from './user/controller/users.controller';
import { RoleRepository } from './role/repositories/role.repository';
import { ROLE_REPOSITORY } from './role/repositories/role.repository.interface';
import { UserRoleRepository } from './user-role/repositories/user-role.repository';
import { USER_ROLE_REPOSITORY } from './repositories/user-role.repository.interface';
import { UserRepository } from './user/repositories/user.repository';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { UsersService } from './services/users.service';

@Module({
  imports: [],
  controllers: [UsersController, AdminController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: USER_ROLE_REPOSITORY,
      useClass: UserRoleRepository,
    },
  ],
  exports: [
    UsersService,
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    USER_ROLE_REPOSITORY,
  ],
})
export class UsersModule {}
