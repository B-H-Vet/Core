import { Module } from '@nestjs/common';

import { UserRoleModule } from '../user-role/user-role.module';

import { UsersController } from './controller/users.controller';
import { UserRepository } from './repositories/user.repository';
import { USER_REPOSITORY } from './repositories/user.repository.interface';
import { UserService } from './services/user.service';
import { USER_SERVICE } from './services/user.service.interface';

@Module({
  imports: [UserRoleModule],
  controllers: [UsersController],
  providers: [
    UserService,
    {
      provide: USER_SERVICE,
      useExisting: UserService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UserService, USER_SERVICE, USER_REPOSITORY],
})
export class UserModule {}
