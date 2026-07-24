import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import TransportHandoverDTO from '../dtos/TransportHandoverDTO';
import S3FileServiceRepository from '../../domain/services/S3FileService';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';

export default class HandoverTransportExternalWasteBagUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly fileService: S3FileServiceRepository,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: TransportHandoverDTO): Promise<string[] | string> {
        try {
            const dataWasteBagQRCode =
                await this.wasteBagRepository.createHandoverTransportExternalWasteBag(
                    data.wasteTransportationExternalGroupId,
                    data.healthcareFacilityId,
                    data.handoverLattitude,
                    data.handoverLongitude,
                    data.vehicleNumber,
                    data.handoverTimestamp,
                    data.manifestDocNumber,
                    data.updatedBy,
                    data.transporterOperatorId,
                    data.treatmentProviderId,
                    data.treatmentOperatorId,
                    data.isReadOnly,
                );

            const { doc_number, document_path } = await this.fileService.uploadImage(
                {
                    originalname: data.file.originalname,
                    mimetype: data.file.mimetype,
                    buffer: data.file.buffer,
                },
                data.manifestDocNumber.toString(),
                data.healthcareFacilityId.toString(),
                'handover',
            );

            await this.wasteBagRepository.updateFilePath(
                data.wasteTransportationExternalGroupId,
                doc_number,
                document_path,
            );

            if (typeof dataWasteBagQRCode !== 'string') {
                if (dataWasteBagQRCode.length > 0) {
                    dataWasteBagQRCode.forEach((id) => {
                        this.wasteStatusUpdateService.logInfo(
                            'Requested waste bag handover to transporter external successfully',
                            'WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime,
                                endTime: data.handoverTimestamp,
                                isGroup: false,
                                user: data.user,
                                entity: data.entity,
                            },
                        );
                    });

                    await this.notificationService.sendMultiNotification(
                        data.user,
                        data.entity,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_HANDOVER.message({
                            group_id: data.wasteTransportationExternalGroupId,
                            vehicle_number: data.vehicleNumber
                        }),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_HANDOVER.title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TRANSPORT_HANDOVER.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );
                } else {
                    dataWasteBagQRCode.forEach((id) => {
                        this.wasteStatusUpdateService.logError(
                            new Error(
                                "Couldn't handover to transport external requested waste bag",
                            ),
                            'WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL_FAILED',
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

            return dataWasteBagQRCode;
        } catch (error) {
            console.error('Error transporting requested waste bags:', error);
            throw new Error('Error transporting requested waste bags');
        }
    }
}
