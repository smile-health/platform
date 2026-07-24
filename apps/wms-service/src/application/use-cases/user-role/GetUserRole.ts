import UserRole from '../../../domain/entities/UserRole';
import UserRoleRepository from '../../../domain/repositories/UserRoleRepository';

export default class GetUserRoleUseCase {
    constructor(private readonly userRoleRepository: UserRoleRepository) {}
    async executeAll(
        limit: number,
        page: number,
        search?: string,
        lang?: string,
    ): Promise<{
        data: UserRole[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const userRole = await this.userRoleRepository.getUserRole(limit, page, search, lang);
            console.log('Fetched all user role successfully:', userRole);
            return userRole;
        } catch (error) {
            console.error('Error fetching all user role:', error);
            throw new Error('Error fetching all user role');
        }
    }
}
