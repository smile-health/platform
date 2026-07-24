import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import TransportHandoverDTO from '../dtos/TransportHandoverDTO';
import S3FileServiceRepository from '../../domain/services/S3FileService';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class HandoverTransportWasteBagUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly fileService: S3FileServiceRepository,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: TransportHandoverDTO): Promise<string[] | string> {
        try {
            const isTransportRequested =
                await this.wasteBagRepository.createHandoverTransportWasteBag(
                    data.wasteTransportationGroupId,
                    // data.wasteBagQrCodeIds,
                    data.handoverLattitude,
                    data.handoverLongitude,
                    data.vehicleNumber,
                    data.handoverTimestamp,
                    data.manifestDocNumber,
                    data.updatedBy,
                );

            const { doc_number, document_path } = await this.fileService.uploadImage(
                {
                    originalname: data.file.originalname,
                    mimetype: data.file.mimetype,
                    buffer: data.file.buffer,
                },
                data.manifestDocNumber,
                data.healthcareFacilityId.toString(),
                'handover',
            );

            await this.wasteBagRepository.updateFilePath(
                data.wasteTransportationGroupId,
                doc_number,
                document_path,
            );

            if (typeof isTransportRequested !== 'string') {
                if (isTransportRequested.length > 0) {
                    isTransportRequested.forEach((id) => {
                        this.wasteStatusUpdateService.logInfo(
                            'Requested waste bag handover to transported successfully',
                            'WASTE_BAG_HANDOVER_TO_TRANSPORTER',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.handoverTimestamp,
                                user: data.user,
                                entity: data.entity,
                            },
                        );
                    });

                    await this.notificationService.sendMultiNotification(
                        data.user,
                        data.entity,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_HANDOVER.message({
                            group_id: isTransportRequested,
                            vehicle_number: data.vehicleNumber,
                        }),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_HANDOVER.title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_HANDOVER.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );

                    console.log('notification sent successfully');
                } else {
                    isTransportRequested.forEach((id) => {
                        this.wasteStatusUpdateService.logError(
                            new Error("Couldn't handover to transport requested waste bag"),
                            'WASTE_BAG_HANDOVER_TO_TRANSPORTER_FAILED',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.handoverTimestamp,
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
