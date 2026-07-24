import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import TransportRequestDTO from '../dtos/TransportRequestDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class TransportExternalRequestedWasteBagUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(token: string, data: TransportRequestDTO): Promise<number | null | string> {
        try {
            const isTransportRequested =
                await this.wasteBagRepository.createTransportExternalRequestedWasteBag(
                    data.wasteBagQrCodeIds,
                    data.consumerId,
                    data.providerType,
                    data.updatedBy,
                    token,
                    // data.transporterOperatorId,
                    data.treatmentProviderId,
                    data.treatmentOperatorId,
                    data.isReadOnly,
                    data.transporterId,
                    data.thirdPartyId
                );

            if (typeof isTransportRequested !== 'string') {
                if (isTransportRequested) {
                    data.wasteBagQrCodeIds.forEach((id) => {
                        this.wasteStatusUpdateService.logInfo(
                            'Requested waste bag followup to transporter external successfully',
                            'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.endTime,
                                isGroup: false,
                                user: data.user,
                                entity: data.entity,
                            },
                        );
                    });

                    await this.notificationService.sendMultiNotification(
                        data.user,
                        data.entity,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_FOLLOW_UP.message({
                            group_id: isTransportRequested,
                        }),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_FOLLOW_UP.title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_FOLLOW_UP.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );
                } else {
                    data.wasteBagQrCodeIds.forEach((id) => {
                        this.wasteStatusUpdateService.logError(
                            new Error("Couldn't transport requested waste bag"),
                            'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL_FAILED',
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
            }

            return isTransportRequested;
        } catch (error) {
            console.error('Error transporting requested waste bags:', error);
            throw new Error('Error transporting requested waste bags');
        }
    }
}
