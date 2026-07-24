import { Request, Response } from 'express';
import EntityLocationRepositoryImpl from '../../../infrastructure/database/repositories/EntityLocationRepositoryImpl';
import GetEntityLocation from '../../../application/use-cases/entity-location/GetEntityLocation';
import CreateEntitySettingUseCase from '../../../application/use-cases/entity-location/CreateEntityLocation';
import GetAllEntityLocationUseCase from '../../../application/use-cases/entity-location/GetAllEntityLocation';
import UpdateEntityLocationUseCase from '../../../application/use-cases/entity-location/UpdateEntityLocation';
import DeleteEntityLocationUseCase from '../../../application/use-cases/entity-location/DeleteEntityLocation';
import GetAllEntityLocationByEntityUseCase from '../../../application/use-cases/entity-location/GetAllEntityLocationByEntity';

export async function getEntityLocationById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new EntityLocationRepositoryImpl();
        const useCase = new GetEntityLocation(repo);

        const data = await useCase.execute(id, token);

        if (data === null) {
            res.fail('EntityLocation not found');
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

export async function createEntityLocation(req: Request, res: Response): Promise<void> {
    try {
        const repo = new EntityLocationRepositoryImpl();
        const useCase = new CreateEntitySettingUseCase(repo);
        let locationType = 'TREATMENT';
        const user: any = req.user;
        const entityType = req.user?.entity?.entity_type?.name;
        let entityTag = req.user?.entity.tag.toString();

        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];

        if (allowedTypes.includes(entityType)) {
            locationType = 'STORAGE';
            entityTag = 'hospital';
        }
        const data = await useCase.execute({
            ...req.body,
            locationType: locationType,
            createdBy: req.user?.user_uuid,
            entityId: req.body.entityId ?? req.user?.entity.id,
            entityTag: entityTag,
        });

        if (typeof data === 'string') {
            res.fail(req.t(`entity-location.error.${data}`), { isValidationError: true });
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

export async function getAllEntityLocationByEntityId(req: Request, res: Response): Promise<void> {
    try {
        const { entityId, healtcareFacilityId, wasteClassificationId } = req.query;
        const repo = new EntityLocationRepositoryImpl();
        const useCase = new GetAllEntityLocationByEntityUseCase(repo);

        return await useCase
            .execute(
                entityId?.toString() as string,
                Number(healtcareFacilityId?.toString()),
                Number(wasteClassificationId?.toString()),
            )
            .then((data) => {
                if (!data) {
                    res.fail(req.t('entity-location.error.NOT_FOUND'));
                    return;
                }
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Enity Location:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t('common.server-error'));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getAllEntityLocation(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search, locationType } = req.query;
        const repo = new EntityLocationRepositoryImpl();
        const useCase = new GetAllEntityLocationUseCase(repo);

        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];

        const isSuperAdmin = roles.includes('super_admin');

        if (isSuperAdmin) {
            if (!locationType) {
                throw new Error('locationType are required.');
            }
        }
        const entityIdParam = isSuperAdmin ? '' : req.user?.entity?.id?.toString();
        const entityType = req.user?.entity?.entity_type?.name;
        let entityTagParam = entityType;

        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];

        if (allowedTypes.includes(entityType)) {
            entityTagParam = 'hospital';
        }

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString(),
                entityIdParam as string,
                entityTagParam,
                locationType?.toString(),
                isSuperAdmin,
            )
            .then((data) => {
                if (!data) {
                    res.fail(req.t('entity-location.error.NOT_FOUND'));
                    return;
                }

                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Enity Location:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t('common.server-error'));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function updateEntityLocation(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('id parameter is required');
            return;
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new EntityLocationRepositoryImpl();
        const useCase = new UpdateEntityLocationUseCase(repo);

        const data = await useCase.execute(token, {
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail(req.t('entity-location.error.NOT_FOUND'));
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

export async function deleteEntitiySettings(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new EntityLocationRepositoryImpl();
        const useCase = new DeleteEntityLocationUseCase(repo);

        const result = await useCase.execute(id.toString(), req.user?.id);

        if (result === null) {
            res.fail(req.t('entity-location.error.NOT_FOUND'));
            return;
        }
        res.success(result);
    } catch (error) {
        console.error('Error deleting data:', error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
