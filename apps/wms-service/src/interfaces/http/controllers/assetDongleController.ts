import { Request, Response } from 'express';
import AssetDongleRepositoryImpl from '../../../infrastructure/database/repositories/AssetDongleRepositoryImpl';
import GetAllAssetDongleUseCase from '../../../application/use-cases/asset-dongle/GetAllAssetDongle';
import CreateAssetDongleUseCase from '../../../application/use-cases/asset-dongle/CreateAssetDongle';
import DeleteAssetDongleUseCase from '../../../application/use-cases/asset-dongle/DeleteAssetDongle';

export async function getAllAssetDongle(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new AssetDongleRepositoryImpl();
        const useCase = new GetAllAssetDongleUseCase(repo);

        useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString(),
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

export async function createAssetDongle(req: Request, res: Response): Promise<void> {
    try {
        const repo = new AssetDongleRepositoryImpl();
        const useCase = new CreateAssetDongleUseCase(repo);

        const data = await useCase.execute({
            ...req.body
        });

        if (typeof data === 'string') {
            res.fail(req.t(`asset-dongle.error.${data}`), { isValidationError: true });
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

export async function deleteAssetDongle(req: Request, res: Response): Promise<void> {
    try {
        const { assetId } = req.params;
        const repo = new AssetDongleRepositoryImpl();
        const useCase = new DeleteAssetDongleUseCase(repo);

        const result = await useCase.execute({ assetId: assetId, deletedBy: req.user?.id });

        if (result === null) {
            res.fail(req.t(`asset-dongle.error.NOT_FOUND`));
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
