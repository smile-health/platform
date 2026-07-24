import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { WasteStatusUpdateService } from '../../../domain/services/WasteStatusUpdateService';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';
import DeleteWasteClassificationDTO from '../../dtos/DeleteWasteClassificationDTO';

export default class DeleteWasteClassificationUseCase {
    constructor(
        private readonly wasteClassificationRepository: WasteClassificationRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: DeleteWasteClassificationDTO): Promise<boolean> {
        try {
            const { id } = data;
            if (!id) {
                throw new Error('ID is required to delete a waste source');
            }

            const dataExist =
                await this.wasteClassificationRepository.getWasteClassificationById(id);

            if (!dataExist) {
                return false;
            }

            const result = await this.wasteClassificationRepository.deleteWasteClassification(id.toString());

            if (typeof result === 'number') {
                this.wasteStatusUpdateService.logInfo(
                    'Waste classification deleted successfully',
                    'WASTE_CLASSIFICATION_DELETED',
                    {
                        wasteBagId: id,
                        createdBy: data.createdBy,
                        treatmentStartTime: new Date(),
                        treatmentEndTime: new Date(),
                        user: data.user,
                        entity: data.entity,
                    },
                );

                await this.notificationService.sendMultiNotification(
                    data.user,
                    data.entity,
                    NOTIFICATION_EVENT_TYPE.DELETE_WASTE_CLASSIFICATION.message({
                        id: id,
                    }),
                    NOTIFICATION_EVENT_TYPE.DELETE_WASTE_CLASSIFICATION.title,
                    NOTIFICATION_EVENT_TYPE.DELETE_WASTE_CLASSIFICATION.type,
                    {
                        forSuperAdmin: true,
                        forAdmin: false,
                        forOperator: false,
                    },
                );
                return true;
            }

            return false
        } catch (error) {
            console.error('Error deleting waste classification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
