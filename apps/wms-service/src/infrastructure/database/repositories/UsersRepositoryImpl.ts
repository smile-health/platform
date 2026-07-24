import { Op, WhereOptions, FindOptions, IncludeOptions } from 'sequelize';
import UsersRepository from '../../../domain/repositories/UsersRepository';
import UsersModel from '../models/UsersModel';
import Users from '../../../domain/entities/Users';
import EntitiesModel from '../models/EntitiesModel';
import UserRoleModel from '../models/UserRoleModel';

export default class UsersRepositoryImpl implements UsersRepository {
    async getUsersId(userId: number): Promise<Users | null> {
        try {
            const data = await UsersModel.findOne({
                where: {
                    id: userId,
                },
                include:[
                    {
                        model: EntitiesModel,
                        as: 'entity',
                        attributes: ['id', 'name', 'province_id', 'regency_id', 'tag', 'is_active','address','type','location'],
                    },
                    {
                        model: UserRoleModel,
                        as: 'userRole',
                        attributes: ['id', 'name', 'name_en', 'type'],
                    }
                ]
            });

            if (!data) {
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error retrieving Users:', error);
            throw new Error('Error retrieving Users');
        }
    }

    async updateUsersStatus(userId: number, data: Users): Promise<Users | null> {
        try {
            const dataUsers = await UsersModel.findOne({
                where: {
                    id: userId,
                },
            });

            if (!dataUsers) {
                console.error(`Users with ID ${userId} not found`);
                return null;
            }

            const updateModelObj = {
                is_active: data.is_active,
            };

            console.log('Update payload:', updateModelObj);

            await UsersModel.update(updateModelObj, {
                where: { id: userId },
            });
            console.log('Users updated successfully');
            return data;
        } catch (error) {
            console.error('Error retrieving Users:', error);
            throw new Error('Error retrieving Users');
        }
    }

    async getAllUsers(
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
    ) {
        try {
            const whereClause: any = {};
            const entityWhere: WhereOptions<any> = {};

            // ----------------- FILTER USERS -----------------
            if (entityTypeId) whereClause['entity_type_id'] = entityTypeId;
            if (userId) whereClause['id'] = userId;
            if (entityId) whereClause['entity_id'] = entityId;
            if (role) {
                whereClause['external_roles'] = role;
            } else {
                whereClause['external_roles'] = {
                    [Op.ne]: '',
                };
            }

            if (isActive !== undefined) whereClause['is_active'] = isActive;

            if (search && search.trim() !== '') {
                whereClause[Op.or] = [
                    { firstname: { [Op.like]: `%${search.trim()}%` } },
                    { lastname: { [Op.like]: `%${search.trim()}%` } },
                    { username: { [Op.like]: `%${search.trim()}%` } },
                ];
            }

            // ----------------- FILTER ENTITIES -----------------
            if (provinceId) entityWhere['province_id'] = provinceId;
            if (regencyId) entityWhere['regency_id'] = regencyId;

            // ----------------- PAGINATION -----------------
            const safeLimit = limit && limit > 0 ? limit : 10;
            const safePage = page && page > 0 ? page : 1;
            const offset = (safePage - 1) * safeLimit;

            // ----------------- INCLUDE RELATION -----------------
            const include: IncludeOptions[] = [
                {
                    model: EntitiesModel,
                    as: 'entity',
                    required: Object.keys(entityWhere).length > 0,
                    where: Object.keys(entityWhere).length > 0 ? entityWhere : undefined,
                    attributes: ['id', 'name', 'province_id', 'regency_id', 'tag','is_active','address','type','location'],
                },
                {
                    model: UserRoleModel,
                    as: 'userRole',
                    attributes: ['id', 'name', 'name_en', 'type'],
                },
            ];

            // ----------------- QUERY OPTIONS -----------------
            const queryOptions: FindOptions = {
                where: whereClause,
                include,
                limit: safeLimit,
                offset,
            };

            if (attributes?.length) queryOptions.attributes = attributes;
            if (groupBy?.length) queryOptions.group = groupBy;

            // ----------------- TOTAL COUNT -----------------
            let totalCount: number;
            if (groupBy?.length) {
                const countResult = await UsersModel.count({
                    where: whereClause,
                    include,
                    group: groupBy,
                    distinct: true,
                });
                totalCount = Array.isArray(countResult)
                    ? countResult.length
                    : Number(countResult) || 0;
            } else {
                totalCount = await UsersModel.count({
                    where: whereClause,
                    include,
                    distinct: true,
                });
            }

            // ----------------- FETCH DATA -----------------
            const users = await UsersModel.findAll(queryOptions);
            const plainData = users.map((u) =>
                typeof u.get === 'function' ? u.get({ plain: true }) : u,
            );

            // ----------------- RETURN -----------------
            return {
                data: plainData,
                pagination: {
                    total: totalCount,
                    pages: Math.ceil(totalCount / safeLimit),
                    currentPage: safePage,
                    perPage: safeLimit,
                },
            };
        } catch (error) {
            console.error('Error fetching Users:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch Users');
        }
    }
}
