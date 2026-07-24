import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import ColdStorageWasteBagDTO from '../dtos/ColdStorageWasteBagDTO';
import StoreWasteDTO from '../dtos/StoreWasteDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class ColdStoreWasteUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: ColdStorageWasteBagDTO): Promise<number | null | string> {
        try {
            const isColdStored = await this.wasteBagRepository.coldStoreWasteBag(
                data.wasteBagQrCodeIds,
                data.createdBy as string,
            );
            if (isColdStored && typeof isColdStored !== 'string') {
                data.wasteBagQrCodeIds.forEach((id) => {
                    this.wasteStatusUpdateService.logInfo(
                        'Waste bag cold stored started successfully',
                        'WASTE_BAG_COLD_STORED_STARTED',
                        {
                            wasteBagId: id,
                            createdBy: data.createdBy,
                            startTime: new Date(),
                            endTime: data.endTime
                                ? new Date(data.endTime).toISOString()
                                : new Date(),
                            user: data.user,
                            entity: data.entity,
                        },
                    );
                });

                await this.notificationService.sendMultiNotification(
                    data.user,
                    data.entity,
                    NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_IN_COLD_STORAGE.message({
                        group_id: isColdStored,
                    }),
                    NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_IN_COLD_STORAGE.title,
                    NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_IN_COLD_STORAGE.type,
                    {
                        forSuperAdmin: true,
                        forAdmin: true,
                        forOperator: true,
                    },
                );
            } else {
                data.wasteBagQrCodeIds.forEach((id) => {
                    this.wasteStatusUpdateService.logError(
                        new Error("Couldn't move waste bag to cold storage"),
                        'WASTE_BAG_COLD_STORAGE_FAILED',
                        {
                            wasteBagId: id,
                            createdBy: data.createdBy,
                            startTime: new Date(),
                            endTime: data.endTime
                                ? new Date(data.endTime).toISOString()
                                : new Date(),
                            isFailed: true,
                        },
                    );
                });
            }
            return isColdStored;
        } catch (error) {
            console.error('Error creating waste bag:', error);
            throw new Error('Error creating waste bag');
        }
    }
}
