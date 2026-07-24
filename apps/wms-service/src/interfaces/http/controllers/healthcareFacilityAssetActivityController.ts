import { Request, Response } from 'express';
import HealthcareFacilityAssetActivityImpl from '../../../infrastructure/database/repositories/HealthcareFacilityAssetActivityImpl';
import CreateHealthcareFacilityAssetActivityUseCase from '../../../application/use-cases/healthcare-facility-asset-activity/CreateHealthcareFacilityAssetActivity';
import GetHealthcareFacilityAssetActivity from '../../../application/use-cases/healthcare-facility-asset-activity/GetHealthcareFacilityAssetActivity';
import HealthcareFacilityAssetImpl from '../../../infrastructure/database/repositories/HealthcareFacilityAssetImpl';

export async function createHealthcareFacilityAssetActivity(req: Request, res: Response) {
    try {
        const repo = new HealthcareFacilityAssetActivityImpl();
        const repoHealthcareFacilityAsset = new HealthcareFacilityAssetImpl();
        const useCase = new CreateHealthcareFacilityAssetActivityUseCase(
            repo,
            repoHealthcareFacilityAsset,
        );

        const healthcarefacilityassetactivity = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
        });
        console.log(
            'Healthcare facility asset activity created successfully(controller):',
            healthcarefacilityassetactivity,
        );
        res.success(healthcarefacilityassetactivity);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getAllHealthcareFacilityAssetActivity(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, activityType, hfAssetId } = req.query;
        const repo = new HealthcareFacilityAssetActivityImpl();
        const useCase = new GetHealthcareFacilityAssetActivity(repo);

        return await useCase
            .executeAll(
                Number(limit?.toString()),
                Number(page?.toString()),
                activityType?.toString(),
                Number(hfAssetId?.toString()),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Healthcare facility asset activity:', error);
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
