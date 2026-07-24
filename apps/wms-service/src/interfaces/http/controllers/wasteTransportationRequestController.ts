import { Request, Response } from 'express';
import WasteTransportationRequestImpl from '../../../infrastructure/database/repositories/WasteTransportationRequestRepoitoryImpl';
import CreateWasteTransportationRequest from '../../../application/use-cases/waste-transportation-request/CreateWasteTransportationRequest';
import GetWasteTransportationRequest from '../../../application/use-cases/waste-transportation-request/GetWasteTransportationRequest';
import UpdateWasteTransportationRequest from '../../../application/use-cases/waste-transportation-request/UpdateWasteTransportationRequest';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/waste-transportation-request/DeleteWasteTransportaionRequest';
import GetAllWasteTransportationRequestUseCase from '../../../application/use-cases/waste-transportation-request/GetAllWasteTransportationRequest';
import WasteBagTransportGroupImpl from '../../../infrastructure/database/repositories/WasteBagTransportGroupImpl';

export async function createWasteTransportationRequest(req: Request, res: Response): Promise<void> {
    try {
        const repo = new WasteTransportationRequestImpl();
        const repoTransportGroup = new WasteBagTransportGroupImpl();
        const useCase = new CreateWasteTransportationRequest(repo, repoTransportGroup);

        const data = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });

        if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
            return;
        } else {
            console.log('Waste Transportation Request created successfully(controller):', data);
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

export async function getWasteTransportationRequestById(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteTransportationRequestImpl();
        const useCase = new GetWasteTransportationRequest(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('Waste Transportation Request not found');
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

export async function getAllWasteTransportationRequests(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new WasteTransportationRequestImpl();
        const useCase = new GetAllWasteTransportationRequestUseCase(repo);

        return await useCase
            .execute(Number(limit?.toString()), Number(page?.toString()), search?.toString())
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste Transportation Request:', error);
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

export async function updateWasteTransportationRequest(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteTransportationRequestImpl();
        const repoTransportGroup = new WasteBagTransportGroupImpl();
        const useCase = new UpdateWasteTransportationRequest(repo, repoTransportGroup);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Waste Transportation Request not found');
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

export async function deleteWasteTransportationRequest(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteTransportationRequestImpl();
        const useCase = new DeleteHealthcareFacilityAsset(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
        console.log('Waste Transportation Request deleted successfully(controller):', data);

        if (!data) {
            res.fail('Waste Transportation Request not found');
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
