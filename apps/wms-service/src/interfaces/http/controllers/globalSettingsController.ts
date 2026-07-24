import { Request, Response } from 'express';
import GlobalSettingsRepositoryImpl from '../../../infrastructure/database/repositories/GlobalSettingsRepositoryImpl';
import GetGlobalSettings from '../../../application/use-cases/global-settings/GetGlobalSettings';
import CreateEntitySettingUseCase from '../../../application/use-cases/global-settings/CreateGlobalSettings';
import GetAllGlobalSettingsUseCase from '../../../application/use-cases/global-settings/GetAllGlobalSettings';
import UpdateGlobalSettingsUseCase from '../../../application/use-cases/global-settings/UpdateGlobalSettings';
import DeleteGlobalSettingsUseCase from '../../../application/use-cases/global-settings/DeleteGlobalSettings';

export async function getGlobalSettingsById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new GlobalSettingsRepositoryImpl();
        const useCase = new GetGlobalSettings(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('GlobalSettings not found');
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

export async function createGlobalSettings(req: Request, res: Response): Promise<void> {
    try {
        const repo = new GlobalSettingsRepositoryImpl();
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

export async function getAllGlobalSettings(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new GlobalSettingsRepositoryImpl();
        const useCase = new GetAllGlobalSettingsUseCase(repo);

        return await useCase
            .execute(Number(limit?.toString()), Number(page?.toString()), search?.toString())
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

export async function updateGlobalSettings(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('id parameter is required');
            return;
        }

        const repo = new GlobalSettingsRepositoryImpl();
        const useCase = new UpdateGlobalSettingsUseCase(repo);

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
        const repo = new GlobalSettingsRepositoryImpl();
        const useCase = new DeleteGlobalSettingsUseCase(repo);

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
