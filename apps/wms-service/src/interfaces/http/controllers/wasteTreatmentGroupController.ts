import { Request, Response } from 'express';
import WasteBagTreatmentGroupImpl from '../../../infrastructure/database/repositories/WasteBagTreatmentGroupImpl';
import GetAllWasteTreatmentGroupUseCase from '../../../application/use-cases/waste-bag-treatment-group/GetAllUseCase';
import GetWasteTreatmentGroupUseCase from '../../../application/use-cases/waste-bag-treatment-group/GetById';
import GetPendingWasteTreatmentGroupsUseCase from '../../../application/use-cases/waste-bag-treatment-group/GetPendingWasteTreatmentGroups';

export async function getAllWasteBagTreatmentGroup(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, startDate, endDate, entityId } = req.query;
        const repo = new WasteBagTreatmentGroupImpl();
        const useCase = new GetAllWasteTreatmentGroupUseCase(repo);

        type AllowedStatus =
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT'
            | 'READY_FOR_TREATMENT'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED';

        const allAllowedStatuses: AllowedStatus[] = [
            'INTERNAL_LANDFILL_IN_PROCESS',
            'INTERNAL_LANDFILLED',
            'IN_TEMPORARY_STORAGE',
            'IN_COLD_STORAGE',
            'INCINERATION_IN_PROCESS',
            'STERILIZATION_IN_PROCESS',
            'INCINERATED',
            'STERILISED',
            'READY_FOR_TRANSPORT',
            'TRANSPORTATION_REQUEST_CREATED',
            'IN_TRANSIT',
            'READY_FOR_TREATMENT',
            'RECYCLED',
            'LANDFILLED',
            'COLLECTED',
            'DISPOSED',
        ];

        const statusParam = req.query.status;
        let status: AllowedStatus | undefined;

        if (
            typeof statusParam === 'string' &&
            allAllowedStatuses.includes(statusParam as AllowedStatus)
        ) {
            status = statusParam as AllowedStatus;
        }

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                entityId ? Number(entityId?.toString()) : req.user?.entity.id,
                startDate ? new Date(startDate.toString()) : new Date(),
                endDate ? new Date(endDate.toString()) : new Date(),
                status,
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste bag treatment group:', error);
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

export async function getWasteBagTreatmentGroup(req: Request, res: Response): Promise<void> {
    try {
        const { id, qrCodeId } = req.query;

        const repo = new WasteBagTreatmentGroupImpl();
        const useCase = new GetWasteTreatmentGroupUseCase(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        return await useCase
            .execute(token, Number(id?.toString()), qrCodeId?.toString())
            .then((data) => {
                if (!data) {
                    res.fail(req.t('waste.error.NOT_FOUND_WG'))
                    return;
                }

                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste bag treatment group:', error);
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

export async function getPendingWasteTreatmentGroupsController(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, entityId } = req.query;
        const repo = new WasteBagTreatmentGroupImpl();
        const useCase = new GetPendingWasteTreatmentGroupsUseCase(repo);
        let healthcareFacilityId: any = entityId;
        if (!entityId) {
            healthcareFacilityId = req.user?.entity.id;
        }

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                Number(healthcareFacilityId?.toString()),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error getPendingWasteTreatmentGroups:', error);
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
