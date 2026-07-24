import { Request, Response } from 'express';
import ListFollowUpTreatmentUseCase from '../../../../application/use-cases/ListFollowUpTreatment';
import GetAllWasteBagUseCase from '../../../../application/use-cases/GetAllWasteBag';
import WasteBagRepositoryImpl from '../../../../infrastructure/database/repositories/WasteBagRepositoryImpl';
import InfraRegistry from '../../../../infrastructure/database/repositories/infraRegistry';
import WasteStatusUpdatePublisher from '../../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher';
import ReceievmentTreatmentExternalWasteBagUseCase from '../../../../application/use-cases/ReceivmentTreatmentExternal';
import { NotificationPublisher } from '../../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';
import TemporaryStoreWasteUseCase from '../../../../application/use-cases/TemporaryStoreWaste';
import ColdStoreWasteUseCase from '../../../../application/use-cases/ColdStoreWaste';
import AutoClaveWasteBag from '../../../../application/use-cases/AutoClaveWasteBag';
import IncinerateWasteBag from '../../../../application/use-cases/IncinerateWasteBag';
import InternalLandfillUseCase from '../../../../application/use-cases/InternalLandfill';
import TransportRequestedWasteBagUseCase from '../../../../application/use-cases/TransportRequestedWasteBag';
import TransportExternalRequestedWasteBagUseCase from '../../../../application/use-cases/TransportExternalRequestedWasteBag';
import TransportRequestDTO from '../../../../application/dtos/TransportRequestDTO';
import PostTreatmentWasteBag from '../../../../application/use-cases/PostTreatmentWasteBag';

export async function followUpTreatmentListController(req: Request, res: Response): Promise<void> {
    try {
        const { wasteBagQrCodeIds } = req.body;
        const updatedBy = req.user?.user_uuid || 'system';

        // Log device info for monitoring/analytics
        if (req.deviceInfo) {
            console.log('Device Info:', {
                deviceType: req.deviceInfo.deviceType,
                appVersion: req.deviceInfo.appVersion,
                userId: req.user?.user_uuid,
                endpoint: '/follow-up-treatment',
            });
        }

        if (!wasteBagQrCodeIds || !Array.isArray(wasteBagQrCodeIds)) {
            res.error(req.t('waste.error.INVALID_ARRAY_WBQC'));
            return;
        }

        const listFollowUpTreatmentUseCase = new ListFollowUpTreatmentUseCase(
            InfraRegistry.wasteBagRepositoryImpl!,
        );

        const treatmentList = await listFollowUpTreatmentUseCase.execute({
            wasteBagQrCodeIds,
            updatedBy,
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

        res.success(treatmentList, {
            message: 'Follow up treatment list retrieved successfully',
            error: null,
            warning: null,
        });
    } catch (error) {
        console.error('Error in followUpTreatmentListController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export async function getWasteBagDetailController(req: Request, res: Response): Promise<void> {
    try {
        const {
            limit = 1,
            page = 1,
            search,
            healthcareId,
            transporterId,
            thirdPartyId,
            wasteUpdateStart,
            wasteUpdateEnd,
            wasteClassificationId,
            transportationGroupId,
            transportationExternalGroupId,
            treatmentGroupId,
            treatmentExternalGroupId,
            sourceType,
            ownedBy,
            wasteStatus,
            binNumber,
            wasteBagQrCodeId,
            id,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isTreated,
            isDisposed,
        } = req.query;

        const repo = new WasteBagRepositoryImpl();
        const useCase = new GetAllWasteBagUseCase(repo);

        let entityType = req.user?.entity.entity_type.name;
        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');
        let entityTag = req.user?.entity.tag.toString();

        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];

        if (allowedTypes.includes(entityType) && !isSuperAdmin) {
            entityTag = 'hospital';
        }

        const wasteBagResult = await useCase.execute(
            Number(limit),
            Number(page),
            search?.toString(),
            Number(healthcareId?.toString()),
            Number(transporterId?.toString()),
            Number(thirdPartyId?.toString()),
            wasteUpdateStart?.toString(),
            wasteUpdateEnd?.toString(),
            wasteClassificationId ? (JSON.parse(wasteClassificationId.toString()) as number[]) : [],
            Number(transportationGroupId?.toString()),
            Number(transportationExternalGroupId?.toString()),
            Number(treatmentGroupId?.toString()),
            Number(treatmentExternalGroupId?.toString()),
            sourceType?.toString(),
            ownedBy?.toString(),
            wasteStatus?.toString(),
            binNumber?.toString(),
            wasteBagQrCodeId?.toString(),
            Number(id?.toString()),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isTreated?.toString() === 'true',
            isDisposed?.toString() === 'true',
            entityTag,
            req.user?.entity.id,
        );

        // Return only the first waste bag data, not pagination
        const detailData = wasteBagResult.data.length > 0 ? wasteBagResult.data[0] : null;

        res.success(detailData, {
            message: detailData ? req.t('waste.success.DETAIL') : req.t('waste.success.NOT_FOUND'),
            error: null,
            warning: null,
        });
    } catch (error) {
        console.error('Error in getWasteBagDetailController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export async function getAllWasteBagController(req: Request, res: Response): Promise<void> {
    try {
        const {
            limit,
            page,
            search,
            healthcareId,
            transporterId,
            thirdPartyId,
            wasteUpdateStart,
            wasteUpdateEnd,
            wasteClassificationId,
            transportationGroupId,
            transportationExternalGroupId,
            treatmentGroupId,
            treatmentExternalGroupId,
            sourceType,
            ownedBy,
            wasteStatus,
            binNumber,
            wasteBagQrCodeId,
            id,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isTreated,
            isDisposed,
            loggerHistory,
        } = req.query;

        const repo = new WasteBagRepositoryImpl();
        const useCase = new GetAllWasteBagUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page),
            search?.toString(),
            Number(healthcareId?.toString()),
            Number(transporterId?.toString()),
            Number(thirdPartyId?.toString()),
            wasteUpdateStart?.toString(),
            wasteUpdateEnd?.toString(),
            wasteClassificationId ? (JSON.parse(wasteClassificationId.toString()) as number[]) : [],
            Number(transportationGroupId?.toString()),
            Number(transportationExternalGroupId?.toString()),
            Number(treatmentGroupId?.toString()),
            Number(treatmentExternalGroupId?.toString()),
            sourceType?.toString(),
            ownedBy?.toString(),
            wasteStatus?.toString(),
            binNumber?.toString(),
            wasteBagQrCodeId?.toString(),
            Number(id?.toString()),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isTreated?.toString() === 'true',
            isDisposed?.toString() === 'true',
            req.user?.entity.tag.toString(),
            req.user?.entity.id,
            loggerHistory?.toString() === '1',
        );

        res.success(wasteBag, {
            message: req.t('waste.success.RETRIEVED'),
            error: null,
            warning: null,
        });
    } catch (error) {
        console.error('Error in getAllWasteBagController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export async function receievmentUpToTreatmentExternal(req: Request, res: Response) {
    try {
        const repo = new WasteBagRepositoryImpl();
        const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
        const notif = new NotificationPublisher();
        const useCase = new ReceievmentTreatmentExternalWasteBagUseCase(
            repo,
            wasteStatusUpdateRepo,
            notif,
        );

        if (!req.user) {
            res.fail(req.t('common.user-info-not-found'), {
                message: req.t('common.user-info-not-found'),
                isValidationError: true,
            });
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

        const data = await useCase.execute({
            ...req.body,
            entityId: req.user?.entity.id,
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

        res.success(data, {
            message: req.t('waste.success.RETRIEVED'),
            error: null,
            warning: null,
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

export async function mobileWasteFollowUpController(req: Request, res: Response): Promise<void> {
    try {
        const { wasteBagQrCodeIds, actionType, startTime, endTime, transporterVehicleId, transporterId, thirdPartyId } =
            req.body;
        const updatedBy = req.user?.user_uuid || 'system';

        if (!wasteBagQrCodeIds || !Array.isArray(wasteBagQrCodeIds)) {
            res.error(req.t('waste.error.INVALID_ARRAY_WBQC'));
            return;
        }

        if (!actionType) {
            res.error(req.t('waste.error.INVALID_ACTION_TYPE'));
            return;
        }

        const repo = new WasteBagRepositoryImpl();
        const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
        const notif = new NotificationPublisher();

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        let result;

        switch (actionType) {
            case 'TEMPORARY_STORAGE': {
                const useCase = new TemporaryStoreWasteUseCase(repo, wasteStatusUpdateRepo, notif);
                result = await useCase.execute({
                    wasteBagQrCodeIds,
                    updatedBy,
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
                break;
            }
            case 'COLD_STORAGE': {
                const useCase = new ColdStoreWasteUseCase(repo, wasteStatusUpdateRepo, notif);
                const endTime = new Date();
                endTime.setDate(endTime.getDate() + 90);

                result = await useCase.execute({
                    wasteBagQrCodeIds,
                    createdBy: updatedBy,
                    endTime: endTime.toISOString(),
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
                break;
            }
            case 'DISINFECTION': {
                const useCase = new AutoClaveWasteBag(repo, wasteStatusUpdateRepo, notif);
                result = await useCase.execute({
                    wasteBagQrCodeIds,
                    treatmentStartTime: startTime,
                    treatmentEndTime: endTime,
                    createdBy: updatedBy,
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
                break;
            }
            case 'PYROLYSIS': {
                const useCase = new IncinerateWasteBag(repo, wasteStatusUpdateRepo, notif);
                result = await useCase.execute({
                    wasteBagQrCodeIds,
                    treatmentStartTime: startTime,
                    treatmentEndTime: endTime,
                    createdBy: updatedBy,
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
                break;
            }
            case 'INTERNAL_LANDFILLER': {
                const useCase = new InternalLandfillUseCase(repo, wasteStatusUpdateRepo, notif);
                result = await useCase.execute({
                    wasteBagQrCodeIds,
                    treatmentStartTime: startTime,
                    treatmentEndTime: endTime,
                    createdBy: updatedBy,
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
                break;
            }
            case 'TRANSPORTER_LANDFILL':
            case 'TRANSPORTER_GOVERNMENT':
            case 'SPECIALIZED_TREATMENT_PROVIDER':
            case 'TRANSPORTER_RECYCLER':
            case 'TRANSPORTER':
            case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
            case 'TRANSPORTER_TREATMENT': {
                const useCase = new TransportExternalRequestedWasteBagUseCase(
                    repo,
                    wasteStatusUpdateRepo,
                    notif,
                );
                const payload: TransportRequestDTO = {
                    wasteBagQrCodeIds,
                    transporterVehicleId: transporterVehicleId,
                    // transporterOperatorId: transporterOperatorId,
                    consumerId: req.user?.entity.id as number,
                    providerType:
                        actionType === 'TRANSPORTER_TREATMENT'
                            ? 'TRANSPORTER_TREATMENT'
                            : actionType === 'TRANSPORTER'
                              ? 'TRANSPORTER'
                              : actionType === 'TRANSPORTER_LANDFILL'
                                ? 'TRANSPORTER_LANDFILL'
                                : actionType === 'TRANSPORTER_GOVERNMENT'
                                  ? 'TRANSPORTER_GOVERNMENT'
                                  : actionType === 'TRANSPORTER_RECYCLER'
                                    ? 'TRANSPORTER_RECYCLER'
                                    : actionType === 'SPECIALIZED_TREATMENT_PROVIDER'
                                      ? 'SPECIALIZED_TREATMENT_PROVIDER'
                                      : 'TRANSPORTER_GOVERNMENT_WASTE_BANK',
                    startTime,
                    endTime,
                    updatedBy,
                    transporterId,
                    thirdPartyId,
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
                };
                result = await useCase.execute(token, payload);
                break;
            }
            default:
                res.error(req.t('waste.error.INVALID_ACTION_TYPE'));
                return;
        }

        if (result === null) {
            res.fail(req.t('waste.error.UNCOMPLETED_ACTION_TYPE'));
            return;
        } else if (typeof result === 'string') {
            res.fail(req.t(`waste.error.${result}`), {
                isValidationError: true,
            });
            return;
        }

        res.success(result, {
            message: req.t('waste.success.FOLLOW_UP_COMPLETED'),
            error: null,
            warning: null,
        });
    } catch (error) {
        console.error('Error in mobileWasteFollowUpController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

export async function mobileWastePostTreatmentController(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const {
            wasteBagQrCodeIds,
            actionType,
            startTime,
            endTime,
            healthcareFacilityId,
            transporterVehicleId,
        } = req.body;
        const updatedBy = req.user?.user_uuid || 'system';

        if (!wasteBagQrCodeIds || !Array.isArray(wasteBagQrCodeIds)) {
            res.error(req.t('waste.error.INVALID_ARRAY_WBQC'));
            return;
        }

        if (!actionType) {
            res.error(req.t('waste.error.INVALID_ACTION_TYPE'));
            return;
        }

        const repo = new WasteBagRepositoryImpl();
        const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
        const notif = new NotificationPublisher();

        const useCase = new PostTreatmentWasteBag(repo, wasteStatusUpdateRepo, notif);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const result = await useCase.execute({
            schema: actionType,
            wasteBagQrCodeIds,
            treatmentStartTime: startTime,
            treatmentEndTime: endTime,
            createdBy: updatedBy,
            healthcareFacilityId: healthcareFacilityId,
            token: token,
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

        if (!result) {
            res.fail(`Post treatment ${actionType} uncompleted`);
            return;
        } else if (typeof result === 'string') {
            res.fail(req.t(`waste.error.${result}`));
        }

        res.success(result, {
            message: `Post treatment ${actionType} completed successfully`,
            error: null,
            warning: null,
        });
    } catch (error) {
        console.error('Error in mobileWasteFollowUpController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}
