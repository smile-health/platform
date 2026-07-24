import { Request, Response } from 'express';
import PartnershipRepositoryImpl from '../../../infrastructure/database/repositories/PartnershipRepositoryImpl';
import CreatePartnershipUseCase from '../../../application/use-cases/partnership/CreatePartnership';
import GetPartnership from '../../../application/use-cases/partnership/GetPatrnership';
import UpdatePartnership from '../../../application/use-cases/partnership/UpdatePartnership';
import DeletePartnership from '../../../application/use-cases/partnership/DeletePartnership';
import GetPatrnershipByUserIdUseCase from '../../../application/use-cases/partnership/GetPatrnershipByUserId';
import GetHealthcareByThirdPartyAdminUseCase from '../../../application/use-cases/partnership/GetHealthcareByThirdPartyAdmin';
import GetPartnershipByThirdPartyAdminUseCase from '../../../application/use-cases/partnership/GetPartnershipByThirdPartyAdmin';
import PartnershipStatusUpdatePublisher from '../../../infrastructure/queue/rabbitmq/publishers/PartnershipStatusUpdatePublisher';
import GetWasteClassificationByHealthcareUseCase from '../../../application/use-cases/partnership/GetWasteClassificationByHealthcare';
import GetWasteClassificationByConsumerIdAndProviderIdUseCase from '../../../application/use-cases/partnership/GetWasteClassificationByConsumerIdAndProviderId';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';
import GetHasMultiplePartnershipUseCase from '../../../application/use-cases/partnership/GetHasMultiplePartnership';
import FindOneThirdPartyUseCase from '../../../application/use-cases/partnership/FindOneThirdParty';

export async function createPartnership(req: Request, res: Response): Promise<void> {
    try {
        const repo = new PartnershipRepositoryImpl();
        const publisher = new PartnershipStatusUpdatePublisher();
        const notif = new NotificationPublisher();
        const useCase = new CreatePartnershipUseCase(repo, publisher, notif);

        let entityId = req.user?.entity.id;

        const dataInput: any = {};

        let entityType = req.user?.entity.entity_type.name;
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (allowedTypes.includes(entityType)) {
            dataInput.consumerId = entityId;
        }

        let transporterId = null;
        if (req.user?.providerType) {
            transporterId = req.user?.entity.id;
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const data = await useCase.execute({
            ...req.body,
            ...dataInput,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
            transporterId: transporterId,
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
        }, token);

        if (data === null) {
            res.fail('Partnership failed to create');
            return;
        } else {
            console.log('Partnership created successfully(controller):', data);
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

export async function getPartnershipById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetPartnership(repo);

        const data = await useCase.execute(id, token);

        if (data === null) {
            res.fail('Partnership not found');
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

export async function getAllPartnerships(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, search, providerId, consumerId, wasteClassificationId, partnershipStatus } = req.query;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }
        let entityType = req.user?.entity.entity_type.name;
        const token = authHeader?.split(' ')[1];

        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];

        const isSuperAdmin = roles.includes('super_admin');
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        let tag = 'third-party';
        if (isSuperAdmin) {
            tag = 'super-admin';
        } else if (allowedTypes.includes(entityType)) {
            tag = 'hospital';
        }

        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetPatrnershipByUserIdUseCase(repo);

        await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                req.user?.entity.id,
                tag,
                token,
                search?.toString(),
                Number(providerId?.toString()),
                Number(consumerId?.toString()),
                Number(wasteClassificationId?.toString()),
                partnershipStatus?.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Partnerships:', error);
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

export async function updatePartnership(req: Request, res: Response): Promise<void> {
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

        let entityId = req.user?.entity.id;

        const dataInput: any = {};

        let entityType = req.user?.entity.entity_type.name;
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (allowedTypes.includes(entityType)) {
            dataInput.consumerId = entityId;
        }

        const repo = new PartnershipRepositoryImpl();
        const publisher = new PartnershipStatusUpdatePublisher();
        const notif = new NotificationPublisher();
        const useCase = new UpdatePartnership(repo, publisher, notif);

        const data = await useCase.execute({
            ...req.body,
            ...dataInput,
            id: Number(id),
            token: token,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
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

        if (data === null) {
            res.fail('Partnership not found');
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

export async function deletePartnership(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new PartnershipRepositoryImpl();
        const useCase = new DeletePartnership(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });

        if (!data) {
            res.fail('Data partnership tidak ada atau partnership sudah digunakan di partnership operator');
            return;
        } else {
            console.log('Partnership deleted successfully(controller):', data);
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

export async function getHealthcareByThirdPartyAdmin(req: Request, res: Response): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetHealthcareByThirdPartyAdminUseCase(repo);

        await useCase
            .execute(token, req.user?.entity.id)
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Partnerships:', error);
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

export async function getPartnershipByThirdPartyAdmin(req: Request, res: Response): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetPartnershipByThirdPartyAdminUseCase(repo);

        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        let entityType = req.user?.entity.entity_type.name;
        let entityTag = req.user?.entity.tag;
        if (allowedTypes.includes(entityType)) {
            entityTag = 'hospital';
        }

        await useCase
            .execute(token, req.user?.entity.id, entityTag)
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Partnerships:', error);
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

export async function getWasteClassificationByHealthcare(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { consumerId, isSameCompany } = req.query;
        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetWasteClassificationByHealthcareUseCase(repo);
        const entityId = req.user?.entity.id;
        if (!entityId) {
            res.fail('entityId required', {
                isValidationError: true,
            });
            return;
        }
        await useCase
            .execute(Number(consumerId?.toString()), entityId, Number(isSameCompany?.toString()))
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Partnerships:', error);
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

export async function getWasteClassificationByConsumerIdAndProviderId(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, providerId, consumerId } = req.query;
        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetWasteClassificationByConsumerIdAndProviderIdUseCase(repo);

        if (!providerId) {
            res.fail('providerId parameter is required');
            return;
        }

        let entityId: number = Number(consumerId?.toString());
        if (!consumerId) {
            entityId = req.user?.entity.id as number;
        }

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                Number(providerId?.toString()),
                entityId,
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

export async function getHasMultiplePartnership(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const repo = new PartnershipRepositoryImpl();
        const useCase = new GetHasMultiplePartnershipUseCase(repo);

        const { healthcareFacilityId, wasteClassificationId } = req.query;

        const entityId =
            healthcareFacilityId != null
                ? Number(healthcareFacilityId)
                : req.user?.entity?.id;

        if (!entityId || Number.isNaN(entityId)) {
            res.fail('entityId required', {
                isValidationError: true,
            });
            return;
        }

        const wasteIds = String(wasteClassificationId ?? '')
            .split(',')
            .map((id) => Number(id.trim()))
            .filter((id) => id > 0 && !Number.isNaN(id));

        if (!wasteIds.length) {
            res.fail('wasteClassificationId required', {
                isValidationError: true,
            });
            return;
        }

        const data = await useCase.execute(entityId, wasteIds);

        res.success(data);
    } catch (error) {
        console.error('Error retrieving partnerships:', error);

        if (error instanceof Error) {
            res.error(error.message);
        } else if (typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function findOneThirdParty(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const repo = new PartnershipRepositoryImpl();
        const useCase = new FindOneThirdPartyUseCase(repo);

        const { transporterId, wasteClassificationId, healthcareFacilityId } = req.query;

        const wasteIds = String(wasteClassificationId ?? '')
            .split(',')
            .map((id) => Number(id.trim()))
            .filter((id) => id > 0 && !Number.isNaN(id));

        if (!wasteIds.length) {
            res.fail('wasteClassificationId required', {
                isValidationError: true,
            });
            return;
        }

        const idTransporter = Number(transporterId);

        if (!idTransporter || Number.isNaN(idTransporter)) {
            res.fail('transporterId required', {
                isValidationError: true,
            });
            return;
        }

        const entityId =
            healthcareFacilityId != null
                ? Number(healthcareFacilityId)
                : req.user?.entity?.id;

        if (!entityId || Number.isNaN(entityId)) {
            res.fail('entityId required', {
                isValidationError: true,
            });
            return;
        }


        const data = await useCase.execute(entityId,idTransporter, wasteIds);

        res.success(data);
    } catch (error) {
        console.error('Error retrieving partnerships:', error);

        if (error instanceof Error) {
            res.error(error.message);
        } else if (typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
