import { Request, Response } from 'express';
import UsersRepositoryImpl from '../../../infrastructure/database/repositories/UsersRepositoryImpl';
import GetUsersByIdUseCase from '../../../application/use-cases/users/GetUsersById';
import UsersDTO from '../../../application/dtos/UsersDTO';
import UpdateUsersStatusUseCase from '../../../application/use-cases/users/UpdateUsers';
import GetAllUsersUseCase from '../../../application/use-cases/users/GetAllUsers';
import { parseBoolean } from '../../../shared/utils/parseBoolean';

export async function getUsersById(req: Request, res: Response): Promise<void> {
    try {
        const { entityId } = req.query;

        let resolvedHealthcareId = entityId;
        let entity = req.user?.entity.id;

        if (!entity) {
            throw new Error('user entity are required.');
        }
        if (!entityId) {
            resolvedHealthcareId = entity.toString();
        }

        const repo = new UsersRepositoryImpl();
        const useCase = new GetUsersByIdUseCase(repo);

        const data = await useCase.execute(Number(resolvedHealthcareId));

        if (data === null) {
            res.success(null);
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function updateUsers(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const { is_active } = req.body;

        const repo = new UsersRepositoryImpl();
        const useCase = new UpdateUsersStatusUseCase(repo);

        const data = await useCase.execute(Number(id), is_active);

        if (data === null) {
            res.fail('Users not found');
            return;
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
    try {
        const {
            entityTypeId,
            entityId,
            groupBy,
            attributes,
            limit,
            page,
            search,
            provinceId,
            regencyId,
            userId,
            role,
            isActive,
        } = req.query;

        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');

        let resolveduserId: any = userId;

        if (!isSuperAdmin) {
            resolveduserId = req.user?.id;
        }

        const repo = new UsersRepositoryImpl();
        const useCase = new GetAllUsersUseCase(repo);

        const parsedEntityTypeId = entityTypeId ? Number(entityTypeId.toString()) : undefined;
        const parsedEntityId = entityId ? Number(entityId.toString()) : undefined;

        const groupByArray: string[] | undefined =
            typeof groupBy === 'string'
                ? groupBy.split(',').map((s) => s.trim())
                : Array.isArray(groupBy)
                  ? (groupBy as string[])
                  : undefined;

        const attributesArray: string[] | undefined =
            typeof attributes === 'string'
                ? attributes.split(',').map((s) => s.trim())
                : Array.isArray(attributes)
                  ? (attributes as string[])
                  : undefined;
        let isReadBool: boolean | undefined;
                if (isActive) {
                    isReadBool = parseBoolean(isActive.toString());
                }
        const data = await useCase.execute(
            isSuperAdmin,
            Number(limit?.toString()),
            Number(page?.toString()),
            parsedEntityTypeId,
            parsedEntityId,
            groupByArray,
            attributesArray,
            search?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            resolveduserId,
            role?.toString(),
            isReadBool,
        );

        if (data === null) {
            res.success('No users found');
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error('Error in getAllUsers controller:', error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t ? req.t('common.server-error') : 'Internal server error');
        }
    }
}
