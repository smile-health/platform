import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import { TreatmentReceivmentDTO } from '../dtos/TreatmentHandoverDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';
import { getEntityDetail } from '../../infrastructure/external-apis/thirdPartyClient';

export default class ReceievmentTreatmentExternalWasteBagUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: TreatmentReceivmentDTO): Promise<number | string> {
        try {
            const listWasteBagUpdate =
                await this.wasteBagRepository.createReceivingTreatmentExternalWasteBag(
                    data.wasteBagQrCodeIds,
                    data.entityId,
                    data.updatedBy,
                    data.startTime ?? new Date().toISOString(),
                    data.endTime ?? new Date().toISOString(),
                );

            if (typeof listWasteBagUpdate !== 'string') {
                const dataHf = await getEntityDetail(
                    listWasteBagUpdate.healthcareFacilityId,
                    data.token,
                );

                if (listWasteBagUpdate.wasteBagQrCodeIds.length > 0) {
                    listWasteBagUpdate.wasteBagQrCodeIds.forEach(async (id) => {
                        await this.wasteStatusUpdateService.logInfoAsync(
                            'Requested waste bag recieved to treatment external successfully',
                            'WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                wasteStatus: 'READY_FOR_TREATMENT',
                                startTime: data.startTime ?? new Date().toISOString(),
                                endTime: data.endTime ?? new Date().toISOString(),
                                isGroup: true,
                                user: data.user,
                                entity: {
                                    id: dataHf.id,
                                    province_id: dataHf.province_id,
                                    regency_id: dataHf.regency_id,
                                },
                            },
                        );
                    });

                    await this.notificationService.sendMultiNotification(
                        data.user,
                        {
                            id: dataHf.id,
                            province_id: dataHf.province_id,
                            regency_id: dataHf.regency_id,
                        },
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TREATMENT_RECEIVMENT.message({
                            group_id: listWasteBagUpdate.groupId,
                        }),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TREATMENT_RECEIVMENT.title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_GROUP_TREATMENT_RECEIVMENT.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );
                } else {
                    listWasteBagUpdate.wasteBagQrCodeIds.forEach((id) => {
                        this.wasteStatusUpdateService.logError(
                            new Error(
                                "Couldn't handover to treatment external requested waste bag",
                            ),
                            'WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL_FAILED',
                            {
                                wasteBagId: id,
                                updatedBy: data.updatedBy,
                                startTime: data.startTime ?? new Date().toISOString(),
                                endTime: data.endTime ?? new Date().toISOString(),
                                isFailed: true,
                            },
                        );
                    });
                }
                return listWasteBagUpdate.groupId;
            }

            return listWasteBagUpdate;
        } catch (error) {
            console.error('Error transporting requested waste bags:', error);
            throw new Error('Error transporting requested waste bags');
        }
    }
}
