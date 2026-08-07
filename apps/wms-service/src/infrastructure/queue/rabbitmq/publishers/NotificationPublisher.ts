import { Publisher } from '@smile-health/lib/rabbitmq/publisher.js';
import { GetConnection } from '@smile-health/lib/rabbitmq/type.js';
import {
    NotificationPayload,
    NOTIFICATION_WORKER,
    NOTIFICATION_MEDIA,
} from '../../../../shared/types/notificationTypes';
import NotificationServiceRepository from '../../../../domain/services/NotificationService';
import { WMS_NOTIFICATION_WORKFLOW_MAP } from './notificationWorkflowMap';

// publishNotification no longer needs a live RabbitMQ connection - it triggers
// Novu directly - so this getConnection is never actually invoked.
const getConnection: GetConnection = async () => {
    throw new Error('RabbitMQ connection not needed for Novu-based notifications');
};

const sharedPublisher = new Publisher(getConnection);

export class NotificationPublisher implements NotificationServiceRepository {
    async processNotification(payload: NotificationPayload): Promise<void> {
        await this.publishNotification(payload.worker, payload);
    }

    async publishNotification<T>(worker: string, payload: T): Promise<void> {
        const type = (payload as { type?: string }).type;
        const workflowId = type
            ? WMS_NOTIFICATION_WORKFLOW_MAP[type] ?? type
            : type;

        await sharedPublisher.publishNotification(undefined, worker, {
            ...payload,
            type: workflowId,
        });
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
