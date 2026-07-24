import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import { HandoverTreatmentExternalDTO } from '../dtos/TransportPickUpDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';
import { getEntityDetail } from '../../infrastructure/external-apis/thirdPartyClient';

export default class HandoverTreatmentExternalWasteBagUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: HandoverTreatmentExternalDTO): Promise<string[] | string> {
        try {
            const dataWasteBagQRCode =
                await this.wasteBagRepository.createHandoverTreatmentExternalWasteBag(
                    data.wasteTransportationExternalGroupIds,
                    data.entityId,
                    data.updatedBy,
                    data.startTime,
                    data.endTime,
                    data.treatmentLocationId,
                    data.treatmentId,
                );

            if (typeof dataWasteBagQRCode !== 'string') {
                const dataHf = await getEntityDetail(
                    dataWasteBagQRCode.healthcareFacilityId,
                    data.token,
                );

                if (dataWasteBagQRCode.wasteBagQrCodeIds.length > 0) {
                    dataWasteBagQRCode.wasteBagQrCodeIds.forEach((id) => {
                        this.wasteStatusUpdateService.logInfo(
                            'Requested waste bag pickup to transported external successfully',
                            'WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.endTime,
                                user: data.user,
                                entity: data.entity,
                            },
                        );
                    });

                    await this.notificationService.sendMultiNotification(
                        data.user,
                        {
                            id: dataHf.id,
                            province_id: dataHf.province_id,
                            regency_id: dataHf.regency_id,
                        },
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_HANDOVER_TO_TREATMENT.message({
                            total_data: dataWasteBagQRCode.wasteBagQrCodeIds.length,
                        }),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_HANDOVER_TO_TREATMENT.title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_HANDOVER_TO_TREATMENT.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );
                } else {
                    dataWasteBagQRCode.wasteBagQrCodeIds.forEach((id) => {
                        this.wasteStatusUpdateService.logError(
                            new Error(
                                "Couldn't handover to transport external requested waste bag",
                            ),
                            'WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL_FAILED',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.endTime,
                                isGroup: false,
                                isFailed: true,
                            },
                        );
                    });
                }

                return dataWasteBagQRCode.wasteBagQrCodeIds;
            }

            return dataWasteBagQRCode;
        } catch (error) {
            console.error('Error transporting requested waste bags:', error);
            throw new Error(error?.toString());
        }
    }
}
