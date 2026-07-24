import ManualScaleRequest from '../../../domain/entities/ManualScaleRequest';
import ManualScaleRequestRepository from '../../../domain/repositories/ManualScaleRequestRepository';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { getUsersDetail } from '../../../infrastructure/external-apis/thirdPartyClient';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';

export default class PatchManualScaleRequestUseCase {
  constructor(
    private readonly repo: ManualScaleRequestRepository,
    private readonly notificationService: NotificationServiceRepository,
  ) {}

  async execute(
    id: number,
    processedBy: string,
    action: 'APPROVED' | 'REJECTED',
    token: string,
    user: {
      id: number;
      email: string;
      mobile_phone: string;
      fcm_token: string;
      entity_id: number;
      province_id?: number;
      regency_id?: number;
    },
    entity: {
      id: number;
      province_id?: number;
      regency_id?: number;
    },
  ): Promise<ManualScaleRequest | string | null> {
    try {
      const data = await this.repo.activateManualScaleRequest(id, processedBy, action);

      if (!data) {
        return null;
      }

      if (typeof data === 'string') return data;

      const dataUser = await getUsersDetail(processedBy, token);

      if (action === 'APPROVED') {
        await this.notificationService.sendMultiNotification(
          user,
          entity,
          NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_APPROVED.message({
            request_id: data.id,
            name: [dataUser?.firstname, dataUser?.lastname].filter(Boolean).join(' '),
          }),
          NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_APPROVED.title,
          NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_APPROVED.type,
          {
            forSuperAdmin: false,
            forAdmin: false,
            forOperator: true,
          },
        );
      } else {
        await this.notificationService.sendMultiNotification(
          user,
          entity,
          NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_REJECTED.message({
            request_id: data.id,
            name: [dataUser?.firstname, dataUser?.lastname].filter(Boolean).join(' '),
          }),
          NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_REJECTED.title,
          NOTIFICATION_EVENT_TYPE.MANUAL_REQUEST_REJECTED.type,
          {
            forSuperAdmin: false,
            forAdmin: false,
            forOperator: true,
          },
        );
      }

      return data;
    } catch (error) {
      console.error('Error fetching regional:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
