import { getChannel } from '../rabbitmq';
import {
    NotificationPayload,
    NOTIFICATION_WORKER,
    NOTIFICATION_MEDIA,
} from '../../../../shared/types/notificationTypes';
import NotificationServiceRepository from '../../../../domain/services/NotificationService';

export class NotificationPublisher implements NotificationServiceRepository {
    private async getChannel() {
        return getChannel();
    }

    async processNotification(payload: NotificationPayload): Promise<void> {
        await this.publishNotification(payload.worker, payload);
    }

    async publishNotification<T>(worker: string, payload: T): Promise<void> {
        const channel = await this.getChannel();
        try {
            channel.assertQueue(worker, { durable: true });
            const result = channel.sendToQueue(worker, Buffer.from(JSON.stringify(payload)));

            console.log(result, 'result', 2222);
            console.log(' [x] Sent %s', worker, payload);
        } catch (error) {
            console.error('Failed to publish message:', error);
            throw error;
        }
    }

    async sendMultiNotification(
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
    ): Promise<void> {
        const payload: NotificationPayload = {
            user: {
                user_id: user.id,
                email: user.email,
                mobile_phone: user.mobile_phone,
                fcm_token: user.fcm_token,
                entity_id: entity.id || user.entity_id,
                province_id: entity.province_id
                    ? entity.province_id === ''
                        ? null
                        : entity.province_id
                    : null,
                regency_id: entity.regency_id
                    ? entity.regency_id === ''
                        ? null
                        : entity.regency_id
                    : null,
            },
            message,
            title,
            type,
            for_super_admin: sendTo?.forSuperAdmin ?? false,
            for_admin: sendTo?.forAdmin ?? false,
            for_operator: sendTo?.forOperator ?? false,
            download_url: options?.downloadUrl,
            action_url: options?.actionUrl,
            worker: NOTIFICATION_WORKER.FIREBASE,
            workerMedia: NOTIFICATION_MEDIA.FCM,
            patient_id: options?.patientId,
            program_id: options?.programId,
        };

        await this.processNotification(payload);
    }
}
