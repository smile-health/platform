import { NotificationPayload } from '../../shared/types/notificationTypes';

export default interface NotificationServiceRepository {
    processNotification(payload: NotificationPayload): Promise<void>;
    publishNotification<T>(worker: string, payload: T): Promise<void>;
    sendMultiNotification(
        user: any,
        entity: any,
        message: string,
        title: string,
        type: string,
        sendTo?: {
            forSuperAdmin?: boolean;
            forAdmin?: boolean;
            forOperator?: boolean;
        },
        options?: {
            downloadUrl?: string;
            actionUrl?: string;
            patientId?: number | null;
            programId?: number | null;
        },
    ): Promise<void>;
}
