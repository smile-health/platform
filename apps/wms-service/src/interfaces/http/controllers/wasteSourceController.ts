import { Request, Response } from 'express';
import WasteSourceRepositoryImpl from '../../../infrastructure/database/repositories/WasteSourceRepoitoryImpl';
import CreateWasteSource from '../../../application/use-cases/waste-source/CreateWasteSource';
import GetWasteSource from '../../../application/use-cases/waste-source/GetWasteSource';
import UpdateWasteSource from '../../../application/use-cases/waste-source/UpdateWasteSource';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/waste-source/DeleteWasteSource';
import GetAllWasteSourceUseCase from '../../../application/use-cases/waste-source/GetAllWasteSource';
import UpdateIsActiveWasteSourceUseCase from '../../../application/use-cases/waste-source/UpdateIsActiveWasteSource';
import WasteBagRepositoryImpl from '../../../infrastructure/database/repositories/WasteBagRepositoryImpl';
import WasteBagQrCodeRepositoryImpl from '../../../infrastructure/database/repositories/WasteBagQrCodeRepoitoryImpl';
import QrCodeConfigRepositoryImpl from '../../../infrastructure/database/repositories/QrCodeConfigRepoitoryImpl';

export async function createWasteSource(req: Request, res: Response): Promise<void> {
    try {
        const repo = new WasteSourceRepositoryImpl();
        const useCase = new CreateWasteSource(repo);

        const data = await useCase.execute({
            ...req.body,
            healthcareFacilityId: req.body.healthcareFacilityId ?? req.user?.entity.id,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Waste source with this internal treatment name already exists', {
                isValidationError: true,
            });
            return;
        }
        console.log('Waste source created successfully(controller):', data);
        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getWasteSourceById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteSourceRepositoryImpl();
        const useCase = new GetWasteSource(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('Waste source not found');
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

export async function getAllWasteSources(req: Request, res: Response): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];
        const { limit, page, search, sourceType } = req.query;
        const repo = new WasteSourceRepositoryImpl();
        const useCase = new GetAllWasteSourceUseCase(repo);

        let entityId = req.user?.entity.id;

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                token,
                Number(entityId?.toString()),
                search?.toString(),
                sourceType?.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste source:', error);
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

export async function updateWasteSource(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteSourceRepositoryImpl();
        const useCase = new UpdateWasteSource(repo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            healthcareFacilityId: req.body.healthcareFacilityId ?? req.user?.entity.id,
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail(
                'Waste source not found, or an internal waste source with this treatment name already exists.',
            );
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

export async function patchWasteSource(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { is_active } = req.query;

        if (!id || !is_active) {
            res.fail('ID parameter is required', {
                isValidationError: true,
            });
            return;
        }

        const isActiveBool =
            typeof is_active === 'string'
                ? is_active === 'true' || is_active === '1'
                : Boolean(is_active);

        const repo = new WasteSourceRepositoryImpl();
        const useCase = new UpdateIsActiveWasteSourceUseCase(repo);

        const data = await useCase.execute(Number(id), isActiveBool);

        if (data === null) {
            res.fail('Waste source not found', {
                isValidationError: true,
            });
            return;
        }
        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function deleteWasteSource(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteSourceRepositoryImpl();
        const repoWasteBag = new WasteBagRepositoryImpl();
        const repoWasteQrCode = new WasteBagQrCodeRepositoryImpl();
        const repoQrCodeConfig = new QrCodeConfigRepositoryImpl();
        const useCase = new DeleteHealthcareFacilityAsset(
            repo,
            repoWasteBag,
            repoWasteQrCode,
            repoQrCodeConfig,
        );

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });

        if (!data) {
            res.fail('Waste source not found');
            return;
        } else if (typeof data === 'string') {
            res.fail(data, {
                isValidationError: true,
            });
            return;
        }
        console.log('Waste source deleted successfully(controller):', data);
        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
