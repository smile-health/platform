import Users from "../entities/Users";

export default interface UsersRepository {
    getUsersId(id: number): Promise<Users | null>;
    updateUsersStatus(entityId: number, payload: Users): Promise<Users | null>;
    getAllUsers(
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
    ): Promise<{
        data: Users[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
