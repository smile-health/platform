import { Request, Response } from 'express';
import WasteClassificationRepositoryImpl from '../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';
import CreateWasteClassificationUseCase from '../../../application/use-cases/waste-classification/CreateWasteClassification';
import GetWasteClassification from '../../../application/use-cases/waste-classification/GetWasteClassification';
import UpdateWasteClassification from '../../../application/use-cases/waste-classification/UpdateWasteClassification';
import DeleteWasteClassificationUseCase from '../../../application/use-cases/waste-classification/DeleteWasteClassification';
import RegionRepositoryImpl from '../../../infrastructure/database/repositories/RegionRepositoryImpl';
import WasteHierarchyImpl from '../../../infrastructure/database/repositories/WasteHierarchyRepositoryImpl';
import { parseBoolean } from '../../../shared/utils/parseBoolean';
import WasteStatusUpdatePublisher from '../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';

export async function createWasteClassification(req: Request, res: Response) {
    try {
        const repo = new WasteClassificationRepositoryImpl();
        const regionRepo = new RegionRepositoryImpl();
        const wasteHierarchyRepo = new WasteHierarchyImpl();
        const useCase = new CreateWasteClassificationUseCase(repo, regionRepo, wasteHierarchyRepo);

        const wasteclassification = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });
        console.log('Waste Classification  created successfully(controller):', wasteclassification);
        res.success(wasteclassification);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getAllWasteClassification(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search, wasteCode, useColdStorage, updatedAt, sortBy, sortOrder,
             wasteTypeId, wasteGroupId, wasteCharacteristicsId } =
            req.query;
        const repo = new WasteClassificationRepositoryImpl();
        const useCase = new GetWasteClassification(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const safeLimit = Number(limit) || 10;
        const safePage = Number(page) || 1;

        let isReadBool: boolean | undefined;
        if (useColdStorage) {
            isReadBool = parseBoolean(useColdStorage.toString());
        }

        const validSortBy =
            sortBy === 'wasteCode' ||
            sortBy === 'useColdStorage' ||
            sortBy === 'updatedAt' ||
            sortBy === 'updated_at'
                ? (sortBy as 'wasteCode' | 'useColdStorage' | 'updatedAt' | 'updated_at')
                : 'updated_at';

        const validSortOrder =
            sortOrder === 'ASC' || sortOrder === 'DESC' ? (sortOrder as 'ASC' | 'DESC') : 'ASC';

        return await useCase
            .executeAll(
                safeLimit,
                safePage,
                token,
                search?.toString(),
                Number(wasteTypeId?.toString()),
                Number(wasteGroupId?.toString()),
                Number(wasteCharacteristicsId?.toString()),
                wasteCode?.toString(),
                isReadBool,
                updatedAt?.toString(),
                validSortBy,
                validSortOrder,
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste classification:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t('common.server-error'));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getWasteClassificationById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new WasteClassificationRepositoryImpl();
        const useCase = new GetWasteClassification(repo);

        const data = await useCase.execute(parseInt(id), token);

        if (data === null) {
            res.fail('Waste source group not found');
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function updateWasteClassification(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteClassificationRepositoryImpl();
        const wasteHierarchyRepo = new WasteHierarchyImpl();
        const useCase = new UpdateWasteClassification(repo, wasteHierarchyRepo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Waste source group not found');
        } else {
            console.log('Waste source group updated successfully(controller):', data);
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function deleteWasteClassification(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new WasteClassificationRepositoryImpl();
        const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
        const notif = new NotificationPublisher();
        const useCase = new DeleteWasteClassificationUseCase(repo, wasteStatusUpdateRepo, notif);

        const data = await useCase.execute({
            id: Number(id),
            createdBy: req.user?.user_uuid as string,
            user: {
                id: req.user?.id as number,
                email: req.user?.email as string,
                mobile_phone: req.user?.mobile_phone as string,
                fcm_token: req.user?.fcm_token as string,
                entity_id: req.user?.entity.id as number,
                province_id: Number(req.user?.entity.province_id),
                regency_id: Number(req.user?.entity.regency_id),
            },
            entity: {
                id: req.user?.entity.id as number,
                province_id: Number(req.user?.entity.province_id),
                regency_id: Number(req.user?.entity.regency_id),
            },
        });
        console.log('Waste classification deleted successfully(controller):', data);

        if (!data) {
            res.fail('Waste classification not found');
            return;
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
