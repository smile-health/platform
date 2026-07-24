import { Request, Response } from 'express';
import WasteBagAuditTrailRepositoryImpl from '../../../infrastructure/database/repositories/WasteBagAuditTrailRepositoryImpl';
import GetAllWasteBagAuditTrail from '../../../application/use-cases/waste-bag-audit-trail/GetAllWasteBagAuditTrail';

export async function getAllWasteBagAuditTrail(req: Request, res: Response): Promise<void> {
    try {
        const {
            limit,
            page,
            search,
            wasteBagId,
            healthcareFacilityId,
            transporterId,
            thirdPartyProviderId,
        } = req.query;
        const repo = new WasteBagAuditTrailRepositoryImpl();
        const useCase = new GetAllWasteBagAuditTrail(repo);

        return await useCase
            .executeAll(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString(),
                wasteBagId?.toString(),
                healthcareFacilityId?.toString(),
                transporterId?.toString(),
                thirdPartyProviderId?.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste Bag Audit Trail:', error);
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
