import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import AutoClaveWasteBagDTO from '../dtos/AutoClaveWasteBagDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class AutoClaveWasteBag {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: AutoClaveWasteBagDTO): Promise<number | null | string> {
        const isAutoclaved = await this.wasteBagRepository.autoclaveWasteBag(
            data.wasteBagQrCodeIds,
            data.createdBy,
            data.treatmentStartTime,
            data.treatmentEndTime,
        );

        if (isAutoclaved && typeof isAutoclaved !== 'string') {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logInfo(
                    'Waste bag sterilised started successfully',
                    'WASTE_BAG_STERILISED_STARTED',
                    {
                        wasteBagId: id,
                        createdBy: data.createdBy,
                        treatmentStartTime: data.treatmentStartTime,
                        treatmentEndTime: data.treatmentEndTime,
                        user: data.user,
                        entity: data.entity,
                    },
                );
            });

            await this.notificationService.sendMultiNotification(
                data.user,
                data.entity,
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS.message({
                    group_id: isAutoclaved,
                }),
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS.title,
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS.type,
                {
                    forSuperAdmin: true,
                    forAdmin: true,
                    forOperator: true,
                },
            );
        } else {
            data.wasteBagQrCodeIds.forEach(async (id) => {
                this.wasteStatusUpdateService.logError(
                    new Error('Waste bag sterilised started failed'),
                    'WASTE_BAG_STERILISED_STARTED_FAILED',
                    {
                        wasteBagId: id,
                        createdBy: data.createdBy,
                        treatmentStartTime: data.treatmentStartTime,
                        treatmentEndTime: data.treatmentEndTime,
                        isGroup: true,
                        isFailed: true,
                    },
                );
            });
        }
        return isAutoclaved;
    }
}
