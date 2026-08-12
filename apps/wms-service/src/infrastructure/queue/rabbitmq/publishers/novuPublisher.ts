import { Novu } from "@novu/api";

// Local copy of the Novu client helper from @smile-health/lib/novu/client.ts.
// wms-service runs as CommonJS on Node/pm2, while @smile-health/lib is ESM
// source-only (run via Bun), so importing it at runtime fails with
// MODULE_NOT_FOUND. Duplicate the small piece we need here instead.
let cachedClient: Novu | undefined;

export function getNovuClient(): Novu | undefined {
  if (cachedClient) {
    return cachedClient;
  }

  const secretKey = process.env.NOVU_SECRET_KEY;
  if (!secretKey) {
    console.error("[NOVU] NOVU_SECRET_KEY not set - failed initialization");
    return undefined;
  }

  cachedClient = new Novu({ secretKey });
  return cachedClient;
}

export interface GetConnection {
  (): Promise<unknown>;
}

export interface NotificationPublishPayload {
  user?: {
    user_id?: number | string;
    email?: string;
    mobile_phone?: string;
    fcm_token?: string;
    entity_id?: number;
    province_id?: number | null;
    regency_id?: number | null;
  };
  user_entity_tag_id?: number | null;
  program_id?: number | null;
  event_code?: string;
  title?: string;
  message?: string;
  type?: string;
  template?: string;
  variables?: unknown[];
  media?: string;
  worker?: string;
  workerMedia?: string;
  titleTranslation?: string;
  messageTranslation?: string;
  data?: string;
}

// Local copy of the Publisher class from @smile-health/lib/rabbitmq/publisher.ts.
// Only the publishNotification (Novu) path is used by wms-service; the
// RabbitMQ publish methods are not needed here.
export class Publisher {
  constructor(private getConnection: GetConnection) {}

  public async publishNotification<T>(
    _c: unknown,
    _worker: string,
    payload: T
  ): Promise<void> {
    const notification = payload as unknown as NotificationPublishPayload;
    const novu = getNovuClient();

    if (!novu) {
      console.error(
        "publishNotification: Novu client not configured, skipping trigger"
      );
      return;
    }

    const subscriberId =
      notification.user?.user_id != null
        ? String(notification.user.user_id)
        : undefined;

    if (!subscriberId || !notification.type) {
      console.error(
        "publishNotification: missing subscriberId or type, skipping Novu trigger"
      );
      return;
    }

    const transactionId = notification.event_code
      ? `${notification.type}-${notification.event_code}-${subscriberId}`
      : undefined;

    try {
      await novu.trigger({
        workflowId: notification.type,
        to: { subscriberId },
        payload: {
          title: notification.titleTranslation ?? notification.title ?? "",
          message:
            notification.messageTranslation ?? notification.message ?? "",
          eventCode: notification.event_code ?? null,
          ...(notification.data ? JSON.parse(notification.data) : {}),
        },
        ...(transactionId ? { transactionId } : {}),
      });
      console.info(
        `Novu notification triggered: ${notification.type} -> ${subscriberId}`
      );
    } catch (error) {
      console.error(`Failed to trigger Novu notification: ${error}`);
      throw error;
    }
  }
}
