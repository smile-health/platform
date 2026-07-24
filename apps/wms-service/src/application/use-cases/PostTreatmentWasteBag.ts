import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import AutoClaveWasteBagDTO from '../dtos/AutoClaveWasteBagDTO';
import NotificationServiceRepository from '../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../shared/types/notificationHelper';
import PostTreatmentWasteBagDTO from '../dtos/PostTreatmentWasteBagDTO';
import { getEntityDetail } from '../../infrastructure/external-apis/thirdPartyClient';

export default class PostTreatmentWasteBag {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: PostTreatmentWasteBagDTO): Promise<boolean | string> {
        const isAutoclaved = await this.wasteBagRepository.postTreatment(
            data.schema,
            data.wasteBagQrCodeIds,
            data.createdBy,
            data.treatmentStartTime,
            data.treatmentEndTime,
        );

        const DISINFECTION_MESSAGE = 'Waste bag sterilised external started';
        const DISINFECTION_EVENT = 'WASTE_BAG_STERILISED_EXTERNAL_STARTED';
        const PYROLYSIS_MESSAGE = 'Waste bag incenerated external started';
        const PYROLYSIS_EVENT = 'WASTE_BAG_INCENERATES_EXTERNAL_STARTED';
        // const LANDFILLED_MESSAGE = 'Waste bag landfilled external started';
        // const LANDFILLED_EVENT = 'WASTE_BAG_LANDFILLED_EXTERNAL_STARTED';
        // const RECYCLED_MESSAGE = 'Waste bag recycled external started';
        // const RECYCLED_EVENT = 'WASTE_BAG_RECYCLED_EXTERNAL_STARTED';
        // const DISPOSED_MESSAGE = 'Waste bag disposed external started';
        // const DISPOSED_EVENT = 'WASTE_BAG_DISPOSED_EXTERNAL_STARTED';
        if (typeof isAutoclaved === 'string') return isAutoclaved;


        const dataHf = await getEntityDetail(data.healthcareFacilityId, data.token);

        if (isAutoclaved) {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logInfo(
                    data.schema === 'DISINFECTION' ? DISINFECTION_MESSAGE : PYROLYSIS_MESSAGE,
                    // : data.schema === 'PYROLYSIS' ? PYROLYSIS_MESSAGE : data.schema === 'LANDFILLED' ? LANDFILLED_MESSAGE : '',
                    //: data.schema === 'RECYCLED' ? RECYCLED_MESSAGE : DISPOSED_MESSAGE,
                    data.schema === 'DISINFECTION' ? DISINFECTION_EVENT : PYROLYSIS_EVENT,
                    // : data.schema === 'PYROLYSIS' ? PYROLYSIS_EVENT : data.schema === 'LANDFILLED' ? LANDFILLED_EVENT  : '',
                    //: data.schema === 'RECYCLED' ? RECYCLED_EVENT : DISPOSED_EVENT,
                    {
                        wasteBagId: id,
                        createdBy: data.createdBy,
                        treatmentStartTime: data.treatmentStartTime,
                        treatmentEndTime: data.treatmentEndTime,
                        user: data.user,
                        entity: {
                            id: dataHf.id,
                            province_id: dataHf.province_id,
                            regency_id: dataHf.regency_id,
                        },
                    },
                );
            });

            switch (data.schema) {
                case 'DISINFECTION': {
                    await this.notificationService.sendMultiNotification(
                        data.user,
                        {
                            id: dataHf.id,
                            province_id: dataHf.province_id,
                            regency_id: dataHf.regency_id,
                        },
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS.message(
                            {
                                group_id: isAutoclaved,
                            },
                        ),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS
                            .title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_STERILISE_IN_PROCESS.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: true,
                        },
                    );
                }
                case 'PYROLYSIS': {
                    await this.notificationService.sendMultiNotification(
                        data.user,
                        {
                            id: dataHf.id,
                            province_id: dataHf.province_id,
                            regency_id: dataHf.regency_id,
                        },
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS.message(
                            {
                                group_id: isAutoclaved,
                            },
                        ),
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS
                            .title,
                        NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_INCINERATE_IN_PROCESS
                            .type,
                            {
                                forSuperAdmin: true,
                                forAdmin: true,
                                forOperator: true,
                            },
                    );
                }
                // case 'LANDFILLED': {
                //     await this.notificationService.sendMultiNotification(
                //         data.user,
                //         data.entity,
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_EXTERNAL_LANDFILLED_IN_PROCESS.message({
                //             group_id: isAutoclaved,
                //         }),
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_EXTERNAL_LANDFILLED_IN_PROCESS.title,
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_EXTERNAL_LANDFILLED_IN_PROCESS.type,
                //     );
                // }
                // case 'RECYCLED': {
                //     await this.notificationService.sendMultiNotification(
                //         data.user,
                //         data.entity,
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_RECYCLED_IN_PROCESS.message({
                //             group_id: isAutoclaved,
                //         }),
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_RECYCLED_IN_PROCESS.title,
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_RECYCLED_IN_PROCESS.type,
                //     );
                // }
                // case 'DISPOSED': {
                //     await this.notificationService.sendMultiNotification(
                //         data.user,
                //         data.entity,
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_DISPOSED_IN_PROCESS.message({
                //             group_id: isAutoclaved,
                //         }),
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_DISPOSED_IN_PROCESS.title,
                //         NOTIFICATION_EVENT_TYPE.WASTE_BAG_TREATMENT_GROUP_DISPOSED_IN_PROCESS.type,
                //     );
                // }
            }
        } else {
            data.wasteBagQrCodeIds.forEach((id) => {
                this.wasteStatusUpdateService.logError(
                    data.schema === 'DISINFECTION'
                        ? new Error(DISINFECTION_MESSAGE + ' failed')
                        : new Error(PYROLYSIS_MESSAGE + ' failed'),
                    //: data.schema === 'PYROLYSIS' ? PYROLYSIS_MESSAGE + ' failed' : data.schema === 'LANDFILLED' ? LANDFILLED_MESSAGE + ' failed' : '',
                    //: data.schema === 'RECYCLED' ? RECYCLED_MESSAGE + ' failed' : DISPOSED_MESSAGE + ' failed',
                    data.schema === 'DISINFECTION'
                        ? DISINFECTION_EVENT + '_FAILED'
                        : PYROLYSIS_EVENT + '_FAILED',
                    //: data.schema === 'PYROLYSIS' ? PYROLYSIS_EVENT + '_FAILED' : data.schema === 'LANDFILLED' ? LANDFILLED_EVENT + '_FAILED' : '',
                    //: data.schema === 'RECYCLED' ? RECYCLED_EVENT + '_FAILED' : DISPOSED_EVENT + '_FAILED',
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
