import { Request, Response } from 'express';
import EntitySettingsRepositoryImpl from '../../../infrastructure/database/repositories/EntitySettingsRepositoryImpl';
import GetEntitySettings from '../../../application/use-cases/entity-settings/GetEntitySettings';
import CreateEntitySettingUseCase from '../../../application/use-cases/entity-settings/CreateEntitySettings';
import GetAllEntitySettingsUseCase from '../../../application/use-cases/entity-settings/GetAllEntitySettings';
import UpdateEntitySettingsUseCase from '../../../application/use-cases/entity-settings/UpdateEntitySettings';
import DeleteEntitySettingsUseCase from '../../../application/use-cases/entity-settings/DeleteEntitySetings';

export async function getEntitySettingsById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new EntitySettingsRepositoryImpl();
        const useCase = new GetEntitySettings(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('EntitySettings not found');
            return;
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function createEntitySettings(req: Request, res: Response): Promise<void> {
    try {
        const repo = new EntitySettingsRepositoryImpl();
        const useCase = new CreateEntitySettingUseCase(repo);
        const data = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            entityId: req.body.entityId ?? req.user?.entity.id,
        });

        if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
            return;
        } else {
            console.log('Entity Settings created successfully(controller):', data);
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getAllEntitySettings(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new EntitySettingsRepositoryImpl();
        const useCase = new GetAllEntitySettingsUseCase(repo);

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString(),
                req.user?.entity.id.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Entity Settings:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function updateEntitySettings(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('id parameter is required');
            return;
        }

        const repo = new EntitySettingsRepositoryImpl();
        const useCase = new UpdateEntitySettingsUseCase(repo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Entity Settings not found');
            return;
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function deleteEntitiySettings(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new EntitySettingsRepositoryImpl();
        const useCase = new DeleteEntitySettingsUseCase(repo);

        const result = await useCase.execute(id.toString(), req.user?.id);

        if (result === null) {
            res.fail({ error: 'data not found' });
            return;
        }
        res.success(result);
    } catch (error) {
        console.error('Error deleting data:', error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
