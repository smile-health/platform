import { formatTitleCase } from "./../../../shared/utils/formating";
import ManualScaleRequest from '../../../domain/entities/ManualScaleRequest';
import ManualScaleRequestRepository from '../../../domain/repositories/ManualScaleRequestRepository';
import ManualScaleRequestDTO from '../../dtos/ManualScaleRequestDTO';
import { ManualScaleRequestService } from '../../../domain/services/ManualScaleRequestService';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';

export default class CreateManualScaleRequestUseCase {
    constructor(
        private readonly repo: ManualScaleRequestRepository,
        private readonly services: ManualScaleRequestService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: ManualScaleRequestDTO): Promise<ManualScaleRequest> {
        try {
            const {
                id,
                requestedBy,
                processedBy,
                isActive,
                status,
                approvalType,
                validUntil,
                countLimit,
                entityId,
            } = data;

            const checkData = await this.repo.checkDataIsExist(requestedBy);

            if (checkData) {
                return checkData;
            }

            const payload: ManualScaleRequest = new ManualScaleRequest({
                id,
                requestedBy,
                processedBy,
                isActive,
                status,
                approvalType,
                validUntil,
                countLimit,
                entityId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await this.repo.createManualScaleRequest(payload);

            this.services.logInfo(
                'Manual request created successfully',
                'START_MANUAL_SCALE_REQUEST',
                {
                    manualScaleId: result.id,
                    createdBy: requestedBy,
                    startTime: result.createdAt,
                    endTime: result.updatedAt,
                },
            );

            await this.notificationService.sendMultiNotification(
                data.user,
                data.entity,
                NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED.message({
                    request_id: result.id,
                    name: formatTitleCase(data.user.name ?? '')
                }),
                NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED.title,
                NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_CREATED.type,
                {
                    forSuperAdmin: false,
                    forAdmin: true,
                    forOperator: false,
                },
                {
                    actionUrl: `/manual-scale/activate?id=${result.id}&status=`,
                },
            );

            return result;
        } catch (error) {
            console.error('Error creating Partner Vehicle:', error);

            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
