import { Request, Response } from 'express';
import WasteBagTransportGroupImpl from '../../../infrastructure/database/repositories/WasteBagTransportGroupImpl';
import CreateWasteTransportationGroup from '../../../application/use-cases/waste-transportation-group/CreateWasteTransportationGroup';
import GetWasteTransportationGroup from '../../../application/use-cases/waste-transportation-group/GetWasteTransportationGroup';
import UpdateWasteTransportationGroup from '../../../application/use-cases/waste-transportation-group/UpdateWasteTransportationGroup';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/waste-transportation-group/DeleteWasteTransportationGroup';
import GetAllWasteTransportationGroupUseCase from '../../../application/use-cases/waste-transportation-group/GetAllWasteTransportationGroup';

export async function createWasteTransportationGroup(req: Request, res: Response): Promise<void> {
    try {
        const repo = new WasteBagTransportGroupImpl();
        const useCase = new CreateWasteTransportationGroup(repo);

        const data = await useCase.execute(
            req.body.wasteBagIds,
            {
                ...req.body,
                createdBy: req.user?.user_uuid,
                updatedBy: req.user?.user_uuid,
            },
            Number(req.user?.entity.id),
        );
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

export async function getWasteTransportationGroupById(req: Request, res: Response): Promise<void> {
    try {
        const { id, qrCodeId } = req.query;

        const repo = new WasteBagTransportGroupImpl();
        const useCase = new GetWasteTransportationGroup(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const data = await useCase.execute(token, id?.toString(), qrCodeId?.toString());

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

export async function getAllWasteTransportationGroups(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, date, entityId } = req.query;
        const repo = new WasteBagTransportGroupImpl();
        const useCase = new GetAllWasteTransportationGroupUseCase(repo);

        type AllowedStatus =
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
                date ? new Date(date.toString()) : undefined,
                status,
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

export async function updateWasteTransportationGroup(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteBagTransportGroupImpl();
        const useCase = new UpdateWasteTransportationGroup(repo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });
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

export async function deleteWasteTransportationGroup(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteBagTransportGroupImpl();
        const useCase = new DeleteHealthcareFacilityAsset(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
        console.log('Waste source deleted successfully(controller):', data);

        if (!data) {
            res.fail('Waste source not found');
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
