import { Request, Response } from 'express';
import AssetManufacturerRepositoryImpl from '../../../infrastructure/database/repositories/AssetManufacturerRepositoryImpl';
import CreateAssetManufacturer from '../../../application/use-cases/asset-manufacturer/CreateAssetManufacturer';
import GetAssetManufacturer from '../../../application/use-cases/asset-manufacturer/GetAssetManufacturer';
import UpdateAssetManufacturer from '../../../application/use-cases/asset-manufacturer/UpdateAssetManufacturer';
import DeleteAsetManufacturer from '../../../application/use-cases/asset-manufacturer/DeleteAsetManufacturer';
import GetAllAssetManufacturerUseCase from '../../../application/use-cases/asset-manufacturer/GetAllAssetManufacturer';

export async function createAssetManufacturer(req: Request, res: Response): Promise<void> {
    try {
        const repo = new AssetManufacturerRepositoryImpl();
        const useCase = new CreateAssetManufacturer(repo);

        const data = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });

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

export async function getAllAssetManufacturers(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search, assetType, name } = req.query;
        const repo = new AssetManufacturerRepositoryImpl();
        const useCase = new GetAllAssetManufacturerUseCase(repo);
        useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString(),
                assetType?.toString(),
                name?.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving asset amnufacture:', error);
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

export async function getAssetManufacturerById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new AssetManufacturerRepositoryImpl();
        const useCase = new GetAssetManufacturer(repo);

        const data = await useCase.execute(id);
        if (!data) {
            res.fail('Asset manufacturer not found');
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

export async function updateAsetManufacturer(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new AssetManufacturerRepositoryImpl();
        const useCase = new UpdateAssetManufacturer(repo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });
        if (data === null) {
            res.fail('Aset Manufacturer not found');
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

export async function deleteManufacturer(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new AssetManufacturerRepositoryImpl();
        const useCase = new DeleteAsetManufacturer(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });

        if (!data) {
            res.fail('Aset Manufacturer not found');
            return;
        } else {
            console.log('Aset Manufacturer deleted successfully(controller):', data);
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
