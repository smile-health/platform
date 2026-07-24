import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import TransportPickupDTO from '../dtos/TransportPickUpDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';
import { getEntityDetail } from '../../infrastructure/external-apis/thirdPartyClient';

export default class PickUpTransportExternalWasteBagUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: TransportPickupDTO): Promise<string[] | string> {
        try {
            const dataWasteBagQRCode =
                await this.wasteBagRepository.createPickUpTransportExternalWasteBag(
                    data.wasteTransportationExternalGroupIds,
                    data.healthcareFacilityId,
                    data.handoverLattitude,
                    data.handoverLongitude,
                    data.updatedBy,
                    data.transporterOperatorId,
                    data.transporterId,
                    data.treatmentProviderId,
                    data.treatmentOperatorId,
                    data.isReadOnly,
                );


            if (typeof dataWasteBagQRCode !== 'string') {
                const dataHf = await getEntityDetail(data.healthcareFacilityId ?? dataWasteBagQRCode.healthcareFacilityId, data.token);

                if (dataWasteBagQRCode.wasteBagQrCodeId.length > 0) {
                    dataWasteBagQRCode.wasteBagQrCodeId.forEach(async (id) => {
                        await this.wasteStatusUpdateService.logInfoAsync(
                            'Requested waste bag pickup to transported external successfully',
                            'WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.endTime,
                                isGroup: true,
                                user: data.user,
                                entity: {
                                    id: dataHf.id,
                                    province_id: dataHf.province_id,
                                    regency_id: dataHf.regency_id,
                                },
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
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_PICKUP.message({
                            group_id: data.wasteTransportationExternalGroupId,
                        }),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_PICKUP.title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_PICKUP.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );
                } else {
                    dataWasteBagQRCode.wasteBagQrCodeId.forEach((id) => {
                        this.wasteStatusUpdateService.logError(
                            new Error(
                                "Couldn't handover to transport external requested waste bag",
                            ),
                            'WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL_FAILED',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.endTime,
                                isFailed: true,
                            },
                        );
                    });
                }

                return dataWasteBagQRCode.wasteBagQrCodeId;
            }

            return dataWasteBagQRCode;
        } catch (error) {
            console.error('Error transporting requested waste bags:', error);
            throw new Error('Error transporting requested waste bags');
        }
    }
}
