export const USER_ROLE_REPOSITORY = 'USER_ROLE_REPOSITORY';

export abstract class IUserRoleRepository {
  abstract findByUserId(userId: number): Promise<any[]>;
  abstract findByUserIdAndRoleId(
    userId: number,
    roleId: number,
  ): Promise<any | null>;
  abstract create(userRole: any): Promise<any>;
  abstract update(userRole: any): Promise<any>;
  abstract revokeByUserId(userId: number, revokedBy: number): Promise<void>;
}
