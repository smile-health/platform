import { Request, Response } from 'express';
import HealthcareFacilityAssetImpl from '../../../infrastructure/database/repositories/HealthcareFacilityAssetImpl';
import CreateHealthcareFacilityModel from '../../../application/use-cases/healthcare-facility-asset/CreateHealthcareFacilityAsset';
import GetHealthcareFacilityAsset from '../../../application/use-cases/healthcare-facility-asset/GetHealthcareFacilityAsset';
import UpdateHealthcareFacilityAsset from '../../../application/use-cases/healthcare-facility-asset/UpdateHealthcareFacilityAsset';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/healthcare-facility-asset/DeleteHealthcareFacilityAsset';
import UpdateIOTHealthcareFacilityAsset from '../../../application/use-cases/healthcare-facility-asset/UpdateIOTHealthcareFacilityAsset';
import AssetModelRepositoryImpl from '../../../infrastructure/database/repositories/AssetModelRepositoryImpl';

export async function createHealthcareFacilityAsset(req: Request, res: Response): Promise<void> {
    try {
        const repo = new HealthcareFacilityAssetImpl();
        const repoAssetModel = new AssetModelRepositoryImpl();
        const useCase = new CreateHealthcareFacilityModel(repo, repoAssetModel);

        const data = await useCase.execute({
            ...req.body,
            healthcareFacilityId: req.body.healthcareFacilityId ?? req.user?.entity_id,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });

        if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
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

export async function getHealthcareFacilityAssetById(req: Request, res: Response): Promise<void> {
    try {
        const repo = new HealthcareFacilityAssetImpl();
        const useCase = new GetHealthcareFacilityAsset(repo);

        const data = await useCase.execute(parseInt(req.params.id));

        if (data === null) {
            res.fail('HealthcareFacilityAsset not found');
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

export async function getAllHealthcareFacilityAssets(req: Request, res: Response): Promise<void> {
    const {
        limit,
        page,
        search,
        healthcareFacilityId,
        assetType,
        manufacturerId,
        isIotEnable,
        assetStatus,
    } = req.query;
    const repo = new HealthcareFacilityAssetImpl();
    const useCase = new GetHealthcareFacilityAsset(repo);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.fail(req.t('common.missing-token'), {
            isValidationError: true,
        });
        return;
    }

    const token = authHeader?.split(' ')[1];

    return useCase
        .executeAll(
            Number(limit?.toString()),
            Number(page?.toString()),
            token.toString(),
            search?.toString(),
            Number(healthcareFacilityId?.toString()),
            assetType?.toString(),
            Number(manufacturerId?.toString()),
            Number(isIotEnable?.toString()),
            assetStatus?.toString(),
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
}

export async function updateHealthcareFacilityAsset(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const repo = new HealthcareFacilityAssetImpl();
        const repoAssetModel = new AssetModelRepositoryImpl();
        const useCase = new UpdateHealthcareFacilityAsset(repo, repoAssetModel);

        const data = await useCase.execute({
            ...req.body,
            healthcareFacilityId: req.body.healthcareFacilityId ?? req.user?.entity_id,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
            id: Number(id),
        });

        if (data === null) {
            res.fail('HealthcareFacilityAsset not found');
            return;
        } else if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
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

export async function patchHealthcareFacilityAsset(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { is_iot_enable } = req.query;

        if (!is_iot_enable) {
            res.fail('is_iot_enable is required', {
                isValidationError: true,
            });
            return;
        }

        const repo = new HealthcareFacilityAssetImpl();
        const useCase = new UpdateIOTHealthcareFacilityAsset(repo);

        const isIotEnableBool =
            typeof is_iot_enable === 'string'
                ? is_iot_enable === 'true' || is_iot_enable === '1'
                : Boolean(is_iot_enable);

        const data = await useCase.execute(Number(id), isIotEnableBool);
        if (data === null) {
            res.fail('HealthcareFacilityAsset not found');
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

export async function deleteHealthcareFacilityAsset(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new HealthcareFacilityAssetImpl();
        const useCase = new DeleteHealthcareFacilityAsset(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
        if (!data) {
            res.fail('HealthcareFacilityAsset not found');
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

export async function getAllHealthcareFacilityAssetsByEntityId(
    req: Request,
    res: Response,
): Promise<void> {
    const { limit, page, search, assetType, manufacturerId } = req.query;
    const repo = new HealthcareFacilityAssetImpl();
    const useCase = new GetHealthcareFacilityAsset(repo);
    return useCase
        .executeAllByEntityId(
            Number(limit?.toString()),
            Number(page?.toString()),
            req.user,
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
}
