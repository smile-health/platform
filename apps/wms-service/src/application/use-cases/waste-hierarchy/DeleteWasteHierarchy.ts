import { Op } from 'sequelize';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';
import DeleteWasteHierarchyDTO from '../../dtos/DeleteWasteHierarchyDTO';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';
import { WasteStatusUpdateService } from '../../../domain/services/WasteStatusUpdateService';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';

export default class DeleteWasteHierarchyUseCase {
    constructor(
        private readonly wasteHierarchyRepository: WasteHierarchyRepository,
        private readonly wasteClassificationRepository: WasteClassificationRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: DeleteWasteHierarchyDTO): Promise<boolean | string> {
        try {
            const { id } = data;
            let existingDataParent: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                    parent_hierarchy_id: id,
                });
            if (existingDataParent) {
                return `ALREADY_EXIST_IN_HIERARCHY`
            }

            const existingDataWasteClassification: any =
                await this.wasteClassificationRepository.findWasteClassificationByCondition({
                    [Op.or]: [
                        { wasteCharacteristicsId: id },
                        { wasteGroupId: id },
                        { wasteTypeId: id },
                    ],
                });

            if (existingDataWasteClassification) {
                return `ALREADY_EXIST_IN_CLASSIFICATION`
            }

            if (!id) {
                return 'NOT_VALID'
            }

            const result =  await this.wasteHierarchyRepository.deleteWasteHierarchy(id.toString());

            if (typeof result === 'boolean' && result === true) {
                this.wasteStatusUpdateService.logInfo(
                    'Waste hierarchy deleted successfully',
                    'WASTE_HIERARCHY_DELETED',
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
                    NOTIFICATION_EVENT_TYPE.DELETE_WASTE_HIERARCHY.message({
                        id: id,
                    }),
                    NOTIFICATION_EVENT_TYPE.DELETE_WASTE_HIERARCHY.title,
                    NOTIFICATION_EVENT_TYPE.DELETE_WASTE_HIERARCHY.type,
                    {
                        forSuperAdmin: true,
                        forAdmin: false,
                        forOperator: false,
                    },
                );
                return true
            }

            return result
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
