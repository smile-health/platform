import { Request, Response } from 'express';
import RegionRepositoryImpl from '../../../infrastructure/database/repositories/RegionRepositoryImpl';
import GetRegion from '../../../application/use-cases/region/GetRegion';
import GetValidationDistanceLimit from '../../../application/use-cases/region/GetDistanceLimit';

export async function getRegionById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new RegionRepositoryImpl();
        const useCase = new GetRegion(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('Region not found');
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

export async function distantLimit(req: Request, res: Response): Promise<void> {
    try {
        const { lat1, lon1, lat2, lon2, type } = req.query;
        const repo = new RegionRepositoryImpl();
        const useCase = new GetValidationDistanceLimit(repo);

        if (type && !['HF', 'TP', 'TRM'].includes(type.toString())) {
            res.fail('Type is not correct HF / TP / TRM ');
        }

        const data = await useCase.execute(
            Number(lat1?.toString()),
            Number(lon1?.toString()),
            Number(lat2?.toString()),
            Number(lon2?.toString()),
            type?.toString() as string,
            req.user?.entity.id as number,
        );

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
