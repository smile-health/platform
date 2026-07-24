import { Request, Response } from 'express';
import WasteHierarchyRepositoryImpl from '../../../infrastructure/database/repositories/WasteHierarchyRepositoryImpl';
import GetWasteHierarchy from '../../../application/use-cases/waste-hierarchy/GetWasteHierarchy';
import WasteHierarchyImpl from '../../../infrastructure/database/repositories/WasteHierarchyRepositoryImpl';
import CreateWasteHierarchyUseCase from '../../../application/use-cases/waste-hierarchy/CreateWasteHierarchy';
import DeleteWasteHierarchyUseCase from '../../../application/use-cases/waste-hierarchy/DeleteWasteHierarchy';
import UpdateWasteHierarchyUseCase from '../../../application/use-cases/waste-hierarchy/UpdateWasteHierarchy';
import WasteClassificationRepositoryImpl from '../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';
import RegionRepositoryImpl from '../../../infrastructure/database/repositories/RegionRepositoryImpl';
import ExplanationOfWasteClassificationUseCase from '../../../application/use-cases/waste-hierarchy/ExplanationOfWasteClassification';
import WasteStatusUpdatePublisher from '../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';

export async function createWasteHierarchy(req: Request, res: Response): Promise<void> {
    try {
        const repo = new WasteHierarchyImpl();
        const regionRepo = new RegionRepositoryImpl();
        const useCase = new CreateWasteHierarchyUseCase(repo, regionRepo);
        const data = await useCase.execute({
            ...req.body,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });
        console.log('Waste Hierarchy created successfully(controller):', data);
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

export async function getWasteHierarchyById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        const repo = new WasteHierarchyRepositoryImpl();
        const useCase = new GetWasteHierarchy(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail(req.t(`waste-hierarchy.error.NOT_FOUND`));
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

export async function getWasteHierarchyByParentHierarchyId(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        let { parent_hierarchy_id } = req.query;
        if (!parent_hierarchy_id) {
            res.fail('parent_hierarchy_id parameter is required');
            return;
        }
        const repo = new WasteHierarchyRepositoryImpl();
        const useCase = new GetWasteHierarchy(repo);

        const data = await useCase.executeByParentHierarchyId(parent_hierarchy_id.toString());

        if (data && data.length > 0) {
            res.success(data);
        } else {
            res.fail(req.t(`waste-hierarchy.error.NOT_FOUND`));
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

export async function getAllWasteHierarchy(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search, level, wasteTypeId, wasteGroupId, isActive } = req.query;
        const repo = new WasteHierarchyRepositoryImpl();
        const useCase = new GetWasteHierarchy(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        return await useCase
            .executeAll(
                Number(limit?.toString()),
                Number(page?.toString()),
                token,
                search?.toString(),
                Number(level?.toString()),
                Number(wasteTypeId?.toString()),
                Number(wasteGroupId?.toString()),
                Number(isActive?.toString()),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste hierarchy:', error);
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

export async function updateWasteHierarchy(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new WasteHierarchyImpl();
        const wasteClassificationRepo = new WasteClassificationRepositoryImpl();
        const useCase = new UpdateWasteHierarchyUseCase(repo, wasteClassificationRepo);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            updatedBy: req.user?.user_uuid,
        });
        if (data === null) {
            res.fail(req.t(`waste-hierarchy.error.NOT_FOUND`));
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

export async function deleteWasteHierarchy(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const repo = new WasteHierarchyImpl();
        const wasteClassificationRepo = new WasteClassificationRepositoryImpl();
        const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
        const notif = new NotificationPublisher();
        const useCase = new DeleteWasteHierarchyUseCase(repo, wasteClassificationRepo, wasteStatusUpdateRepo, notif);

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
        console.log('Waste hierarchy deleted successfully(controller):', data);

        if (typeof data === 'string') {
            res.fail(req.t(`waste-hierarchy.error.${data}`));
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

export async function explanationOfWasteClassification(req: Request, res: Response): Promise<void> {
    try {
        const repo = new WasteHierarchyRepositoryImpl();
        const useCase = new ExplanationOfWasteClassificationUseCase(repo);

        return await useCase
            .execute()
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste hierarchy:', error);
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
