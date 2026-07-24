import { Request, Response } from 'express';
import PartnershipVehicleMapImpl from '../../../infrastructure/database/repositories/PartnershipVehicleMapRepoitoryImpl';
import CreatePartnershipVehicleMap from '../../../application/use-cases/partnership-vehicle-map/CreatePartnershipVehicleMap';
import DeletePartnershipVehicleMapUseCase from '../../../application/use-cases/partnership-vehicle-map/DeletePartnershipVehicleMap';
import GetAllPartnershipVehicleMapUseCase from '../../../application/use-cases/partnership-vehicle-map/GetAllPartnershipVehicleMap';
import PartnershipRepositoryImpl from '../../../infrastructure/database/repositories/PartnershipRepositoryImpl';

export async function createPartnershipVehicleMap(req: Request, res: Response): Promise<void> {
    try {
        const repo = new PartnershipVehicleMapImpl();
        const repoPartnership = new PartnershipRepositoryImpl();
        const useCase = new CreatePartnershipVehicleMap(repo, repoPartnership);

        const data = await useCase.execute({
            ...req.body,
        });

        if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
            return;
        } else {
            console.log('Waste source created successfully(controller):', data);
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

export async function getAllPartnershipVehicleMaps(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search } = req.query;
        const repo = new PartnershipVehicleMapImpl();
        const useCase = new GetAllPartnershipVehicleMapUseCase(repo);

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                search?.toString() ?? req.user?.entity.id.toString(),
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

export async function deletePartnershipVehicleMap(req: Request, res: Response): Promise<void> {
    try {
        console.log(req.query);
        const { partnership_id, vehicle_id } = req.query;

        if (!partnership_id || !vehicle_id) {
            res.fail('partnership_id and vehicle_id parameter is required');
            return;
        }

        const repo = new PartnershipVehicleMapImpl();
        const useCase = new DeletePartnershipVehicleMapUseCase(repo);

        const data = await useCase.execute(
            Number(partnership_id?.toString()),
            Number(vehicle_id?.toString()),
            req.user?.id,
        );

        if (data === null) {
            res.fail('Partnership vehicle map not found');
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
