import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import StoreWasteDTO from '../dtos/StoreWasteDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class TemporaryStoreWasteUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: StoreWasteDTO): Promise<number | null | string> {
        try {
            const { wasteBagQrCodeIds, updatedBy } = data;

            const isTemporaryStored = await this.wasteBagRepository.temporaryStoreWasteBag(
                wasteBagQrCodeIds,
                updatedBy,
            );

            if (isTemporaryStored && typeof isTemporaryStored !== 'string') {
                wasteBagQrCodeIds.forEach((wasteBagQrCodeId) => {
                    this.wasteStatusUpdateService.logInfo(
                        'Waste bag in temporarily stored successfully',
                        'WASTE_BAG_TEMPORARY_STORED',
                        {
                            wasteBagId: wasteBagQrCodeId,
                            updatedBy: updatedBy,
                            startTime: new Date(),
                            endTime: new Date(),
                            user: data.user,
                            entity: data.entity,
                        },
                    );
                });

                await this.notificationService.sendMultiNotification(
                    data.user,
                    data.entity,
                    NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_IN_TEMPORARY_STORAGE.message({
                        group_id: isTemporaryStored,
                    }),
                    NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_IN_TEMPORARY_STORAGE.title,
                    NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_IN_TEMPORARY_STORAGE.type,
                    {
                        forSuperAdmin: true,
                        forAdmin: true,
                        forOperator: true,
                    },
                );
            } else {
                wasteBagQrCodeIds.forEach((wasteBagQrCodeId) => {
                    this.wasteStatusUpdateService.logError(
                        new Error("Couldn't moved waste bag to temporary storage"),
                        'WASTE_BAG_TEMPORARY_STORAGE_FAILED',
                        {
                            wasteBagId: wasteBagQrCodeId,
                            updatedBy: updatedBy,
                            startTime: new Date(),
                            endTime: new Date(),
                            isFailed: true,
                        },
                    );
                });
            }
            return isTemporaryStored;
        } catch (error) {
            console.error('Error creating waste bag:', error);
            throw new Error('Error creating waste bag');
        }
    }
}
