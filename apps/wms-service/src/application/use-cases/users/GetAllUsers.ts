import Users from '../../../domain/entities/Users';
import UsersRepository from '../../../domain/repositories/UsersRepository';

export default class GetAllUsersUseCase {
    constructor(private readonly repo: UsersRepository) {}

    async execute(
        isSuperAdmin?: boolean,
        limit?: number,
        page?: number,
        entityTypeId?: number,
        entityId?: number,
        groupBy?: string[],
        attributes?: string[],
        search?: string,
        provinceId?: number,
        regencyId?: number,
        userId?: number,
        role?: string,
        isActive?: boolean,
    ): Promise<
        | {
              data: Users[];
              pagination: {
                  total: number;
                  pages: number;
                  currentPage: number;
                  perPage: number;
              };
          }
        | Users
        | null
    > {
        try {
            // Jika super admin → ambil semua users (ada pagination)
            if (isSuperAdmin && userId === undefined) {
                return await this.repo.getAllUsers(
                    limit,
                    page,
                    entityTypeId,
                    entityId,
                    groupBy,
                    attributes,
                    search,
                    provinceId,
                    regencyId,
                    userId,
                    role,
                    isActive,
                );
            }

            // Jika bukan super admin → ambil user berdasarkan ID
            if (userId) {
                return await this.repo.getUsersId(userId);
            }

            throw new Error('User ID is required for non-super-admin user');
        } catch (error) {
            console.error('Error in GetAllUsersUseCase:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
        }
    }
}
