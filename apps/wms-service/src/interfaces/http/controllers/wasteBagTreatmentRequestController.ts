import { Request, Response } from 'express';
import WasteBagTreatmentRequestImpl from '../../../infrastructure/database/repositories/WasteBagTreatmentRequestRepoitoryImpl';
import CreateWasteBagTreatmentRequest from '../../../application/use-cases/waste-bag-treatment-request/CreateWasteBagTreatmentRequest';
import GetWasteBagTreatmentRequest from '../../../application/use-cases/waste-bag-treatment-request/GetWasteBagTreatmentRequest';
import UpdateWasteBagTreatmentRequest from '../../../application/use-cases/waste-bag-treatment-request/UpdateWasteBagTreatmentRequest';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/waste-bag-treatment-request/DeleteWasteBagTreatmentRequest';
import GetAllWasteBagTreatmentRequestUseCase from '../../../application/use-cases/waste-bag-treatment-request/GetAllWasteBagTreatmentRequest';

export async function createWasteBagTreatmentRequest(req: Request, res: Response): Promise<void> {
    try {
        const repo = new WasteBagTreatmentRequestImpl();
        const useCase = new CreateWasteBagTreatmentRequest(repo);

        const data = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });

        if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
            return;
        } else {
            console.log('Waste bag treatment request created successfully(controller):', data);
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

export async function getWasteBagTreatmentRequestById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteBagTreatmentRequestImpl();
        const useCase = new GetWasteBagTreatmentRequest(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('Waste bag treatment request not found');
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

export async function getAllWasteBagTreatmentRequests(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new WasteBagTreatmentRequestImpl();
        const useCase = new GetAllWasteBagTreatmentRequestUseCase(repo);

        return await useCase
            .execute(Number(limit?.toString()), Number(page?.toString()), search?.toString())
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste bag treatment request:', error);
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

export async function updateWasteBagTreatmentRequest(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteBagTreatmentRequestImpl();
        const useCase = new UpdateWasteBagTreatmentRequest(repo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Waste bag treatment request not found');
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

export async function deleteWasteBagTreatmentRequest(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteBagTreatmentRequestImpl();
        const useCase = new DeleteHealthcareFacilityAsset(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
        console.log('Waste bag treatment request deleted successfully(controller):', data);

        if (!data) {
            res.fail('Waste bag treatment request not found');
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
