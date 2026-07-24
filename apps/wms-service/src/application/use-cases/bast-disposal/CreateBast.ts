import DisposalRepository from '../../../domain/repositories/DisposalRepository';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { getEntityDetail } from '../../../infrastructure/external-apis/thirdPartyClient';
import { BastBody } from '../../../shared/types/bastType';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';

export default class CreateDisposalUseCase {
    constructor(
        private readonly repo: DisposalRepository,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(
        data: BastBody,
        user: any,
        token: string,
    ): Promise<{ bast_no: string } | null | string> {
        try {
            const result = await this.repo.createDisposal(data);

            if (typeof result !== 'string' && result !== null) {
                const dataHf = await getEntityDetail(data.sender.entity_id, token);

                await this.notificationService.sendMultiNotification(
                    user,
                    {
                        id: dataHf.id,
                        province_id: dataHf.province_id,
                        regency_id: dataHf.regency_id,
                    },
                    NOTIFICATION_EVENT_TYPE.REQUEST_BAST_NUMBER.message({
                        bastNo: result.bast_no,
                    }),
                    NOTIFICATION_EVENT_TYPE.REQUEST_BAST_NUMBER.title,
                    NOTIFICATION_EVENT_TYPE.REQUEST_BAST_NUMBER.type,
                    {
                        forSuperAdmin: true,
                        forAdmin: true,
                        forOperator: true,
                    },
                    {
                        actionUrl: result.bast_no,
                    },
                );

                return result;
            }

            return result;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
