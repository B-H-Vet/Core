import { Module } from '@nestjs/common';

import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { UserRoleModule } from './user-role/user-role.module';

@Module({
  imports: [UserModule, RoleModule, UserRoleModule],
  exports: [UserModule, RoleModule, UserRoleModule],
})
export class UsersModule {}
