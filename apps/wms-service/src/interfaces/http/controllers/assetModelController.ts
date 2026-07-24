import { Request, Response } from 'express';
import AssetModelRepositoryImpl from '../../../infrastructure/database/repositories/AssetModelRepositoryImpl';
import CreateAssetModel from '../../../application/use-cases/asset-model/CreateAssetModel';
import GetAssetModelByIdUseCase from '../../../application/use-cases/asset-model/GetAssetModel';
import UpdateAssetModelUseCase from '../../../application/use-cases/asset-model/UpdateAssetModel';
import DeleteAssetModelUseCase from '../../../application/use-cases/asset-model/DeleteAssetModel';
import GetAllAssetModelByIdUseCase from '../../../application/use-cases/asset-model/GetAllAssetModel';
import AssetManufacturerRepositoryImpl from '../../../infrastructure/database/repositories/AssetManufacturerRepositoryImpl';
import HealthcareFacilityAssetImpl from '../../../infrastructure/database/repositories/HealthcareFacilityAssetImpl';

export async function getAllAssetModels(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search, assetType, manufacturerId } = req.query;
        const repo = new AssetModelRepositoryImpl();
        const useCase = new GetAllAssetModelByIdUseCase(repo);

        useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString(),
                assetType?.toString(),
                Number(manufacturerId?.toString()),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving asset models:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error('Unexpected error in getAllAssetModels:', error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getAssetModelById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new AssetModelRepositoryImpl();
        const useCase = new GetAssetModelByIdUseCase(repo);

        const data = await useCase.execute(parseInt(id));

        if (data === null) {
            res.fail('Asset model not found');
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

export async function createAssetModel(req: Request, res: Response): Promise<void> {
    try {
        const repo = new AssetModelRepositoryImpl();
        const repoManufacturer = new AssetManufacturerRepositoryImpl();
        const useCase = new CreateAssetModel(repo, repoManufacturer);

        const data = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });

        if (typeof data === 'string') {
            res.fail(req.t(`asset.error.${data}`), { isValidationError: true });
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

export async function updateAssetModel(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.error('ID is required to update an asset model');
            return;
        }

        const repo = new AssetModelRepositoryImpl();
        const repoManufacturer = new AssetManufacturerRepositoryImpl();
        const useCase = new UpdateAssetModelUseCase(repo, repoManufacturer);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Asset model not found');
            return;
        } else if (typeof data === 'string') {
            res.fail(req.t(`asset.error.${data}`), { isValidationError: true });
            return;
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error('Unexpected error in updateAssetModel:', error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function deleteAssetModel(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new AssetModelRepositoryImpl();
        const healthcareFacilityAssetRepo = new HealthcareFacilityAssetImpl();
        const useCase = new DeleteAssetModelUseCase(repo, healthcareFacilityAssetRepo);

        const result = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });

        if (result === null) {
            res.fail(req.t(`asset.error.NOT_FOUND`));
            return;
        }
        res.success(result);
    } catch (error) {
        console.error('Error deleting asset model:', error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
