import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import IncinerateWasteBagDTO from '../dtos/IncinerateWasteBagDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class IncinerateWasteBag {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: IncinerateWasteBagDTO): Promise<number | null | string> {
        const isIncinerated = await this.wasteBagRepository.incinerateWasteBag(
            data.wasteBagQrCodeIds,
            data.createdBy,
            data.treatmentStartTime,
            data.treatmentEndTime,
        );

        if (isIncinerated && typeof isIncinerated !== 'string') {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logInfo(
                    'Waste bag incineration started successfully',
                    'WASTE_BAG_INCINERATION_STARTED',
                    {
                        wasteBagId: id,
                        createdBy: data.createdBy,
                        treatmentStartTime: data.treatmentStartTime,
                        treatmentEndTime: data.treatmentEndTime,
                        isGroup: false,
                        user: data.user,
                        entity: data.entity,
                    },
                );
            });

            await this.notificationService.sendMultiNotification(
                data.user,
                data.entity,
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS.message({
                    group_id: isIncinerated,
                }),
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS.title,
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS.type,
                {
                    forSuperAdmin: true,
                    forAdmin: true,
                    forOperator: true,
                },
            );
        } else {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logError(
                    new Error("Couldn't incinerate waste bag"),
                    'WASTE_BAG_INCINERATION_FAILED',
                    {
                        wasteBagId: id,
                        createdBy: data.createdBy,
                        treatmentStartTime: data.treatmentStartTime,
                        treatmentEndTime: data.treatmentEndTime,
                        isGroup: false,
                        isFailed: true,
                    },
                );
            });
        }
        return isIncinerated;
    }
}
