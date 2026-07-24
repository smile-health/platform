import { UserRoleModel } from '../models/UserRoleModel';
import UserRole from '../../../domain/entities/UserRole';
import UserRoleRepository from '../../../domain/repositories/UserRoleRepository';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op } from 'sequelize';

export default class UserRoleImpl implements UserRoleRepository {
    async getUserRole(
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
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
            });
            const offset = (safePage - 1) * safeLimit;
            const { count, rows } = await UserRoleModel.findAndCountAll({
                limit: safeLimit,
                offset,
                order: [['id', 'ASC']],
                where: {
                    ...(search && {
                        [Op.or]: [
                            { name: { [Op.like]: `%${search}%` } },
                            { name_en: { [Op.like]: `%${search}%` } },
                        ],
                    }),
                },
            });

            const formattedData = await Promise.all(
                rows.map(async (data: any) => {
                    const base = new UserRole({
                        id: data.id,
                        name: data.name,
                        type: data.type,
                        description: data.description,
                        regionId: data.regionId,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        updatedBy: data.updatedBy,
                        createdBy: data.createdBy,
                    });

                    if (lang === 'en' && data.nameEn) {
                        base.name = data.nameEn;
                    }

                    return base;
                }),
            );

            return paginationUtils.formatPaginationResult(
                formattedData,
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving user role:', error);
            throw new Error('Error retrieving user role');
        }
    }
}
