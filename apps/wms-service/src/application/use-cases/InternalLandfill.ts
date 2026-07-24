import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import AutoClaveWasteBagDTO from '../dtos/AutoClaveWasteBagDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class InternalLandfillUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: AutoClaveWasteBagDTO): Promise<number | null | string> {
        const isLandfilled = await this.wasteBagRepository.internalLandfillTreatment(
            data.wasteBagQrCodeIds,
            data.createdBy,
            data.treatmentStartTime,
            data.treatmentEndTime,
        );

        if (isLandfilled && typeof isLandfilled !== 'string') {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logInfo(
                    'Waste bag internal landfilled successfully',
                    'WASTE_BAG_INTERNAL_LANDFILL_STARTED',
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
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILL_IN_PROCESS.message(
                    {
                        group_id: isLandfilled,
                    },
                ),
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILL_IN_PROCESS
                    .title,
                NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INTERNAL_LANDFILL_IN_PROCESS.type,
                {
                    forSuperAdmin: true,
                    forAdmin: true,
                    forOperator: true,
                },
            );
        } else {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logError(
                    new Error('Waste bag internal landfilled started failed'),
                    'WASTE_BAG_INTERNAL_LANDFILL_FAILED',
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
        return isLandfilled;
    }
}
