import i18next from 'i18next';
import '../../../interfaces/http/middlewares/i18n';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { authenticateDatabase, sequelize } from '../../../infrastructure/database/db.connection';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';
import { connectRabbitMQ } from '../../../infrastructure/queue/rabbitmq/rabbitmq';
import {
  NOTIFICATION_MEDIA,
  NOTIFICATION_WORKER,
  NotificationPayload,
} from '../../../shared/types/notificationTypes';

const NOTIF_LANG = process.env.NOTIF_LANG || 'id';
const LIMIT_WASTE_BAG = process.env.LIMIT_CRON_INACTIVE_USER_WASTE_BAG || 1000;
const LIMIT_USER = process.env.LIMIT_CRON_INACTIVE_USER || 1000;

interface UserToNotif {
  id: number;
  username: string;
  email: string;
  mobile_phone: string;
  fcm_token: string;
  entity_id: number;
  province_id?: number;
  regency_id?: number;
  entity_name?: string;
  regency_name?: string;
  type?: number;
}

const translateString = (key: string, options?: any): string => {
  const translation = i18next.t(key, options);
  return typeof translation === 'string' ? translation : JSON.stringify(translation);
};

const isSendDataNotif = (user: UserToNotif, dataItem: any): boolean => {
  const { entity_id, province_id, regency_id, type } = user;
  switch (type) {
    case 1:
      return Number(dataItem.province_id) === Number(province_id);
    case 2:
      return Number(dataItem.regency_id) === Number(regency_id);
    case 3:
      return Number(dataItem.healthcare_facility_id) === Number(entity_id);
    default:
      return false;
  }
};

const sendNotificationToUsers = async (
  user: UserToNotif,
  notifService: NotificationServiceRepository,
  data: any,
) => {
  for (const item of data) {
    const isNotif = isSendDataNotif(user, item);
    const payload: NotificationPayload = {
      user: {
        user_id: user.id,
        email: user.email,
        mobile_phone: user.mobile_phone,
        entity_id: user.entity_id,
        province_id: user.province_id || null,
        regency_id: user.regency_id || null,
        fcm_token: user.fcm_token,
      },
      message: JSON.stringify(item),
      title: 'notification.maximum_temporary_storage.title',
      titleTranslation: translateString('notification.maximum_temporary_storage.title'),
      messageTranslation: translateString('notification.maximum_temporary_storage.message', item),
      type: 'notification.maximum_temporary_storage.message',
      for_super_admin: true,
      for_admin: true,
      for_operator: true,
      worker: NOTIFICATION_WORKER.FIREBASE,
      workerMedia: NOTIFICATION_MEDIA.FCM,
    };
    if (isNotif) {
      await notifService.processNotification(payload);
    }
  }
};

const getUserToNotify = async (data: any, notifService: NotificationServiceRepository) => {
  const provinceIds = data.map((row: any) => row.province_id);
  const regencyIds = data.map((row: any) => row.regency_id);
  const entityIds = data.map((row: any) => row.healthcare_facility_id);
  const limit = Number(LIMIT_USER);
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const [users] = (await sequelize.query(
      `
        SELECT 
            u.id, 
            u.username, 
            u.email,
            u.mobile_phone,
            u.entity_id,
            e.name AS entity_name,
            e.regency_name,
            e.province_id,
            e.regency_id,
            e.type,
            uft.token AS fcm_token
        FROM users u
        LEFT JOIN entities e ON u.entity_id = e.id
        LEFT JOIN (
          SELECT t1.*
          FROM user_fcm_token t1
            INNER JOIN (
              SELECT 
                user_id,
                entity_id,
                MAX(created_at) AS max_created_at
            FROM user_fcm_token
          GROUP BY user_id, entity_id
          ) t2
          ON t1.user_id = t2.user_id
          AND t1.entity_id = t2.entity_id
          AND t1.created_at = t2.max_created_at
        ) uft ON u.id = uft.user_id AND u.entity_id = uft.entity_id  
        WHERE (
          u.entity_id IN (:entityIds) 
          OR e.regency_id IN (:regencyIds) 
          OR e.province_id IN (:provinceIds)
        ) AND e.type IN (1, 2, 3)
        AND u.is_active = 1
        AND u.deleted_at IS NULL
        LIMIT :limit OFFSET :offset
    `,
      {
        replacements: {
          entityIds,
          regencyIds,
          provinceIds,
          limit,
          offset,
        },
      },
    )) as UserToNotif[][];

    console.log(`--- User Batch offset ${offset}`, users.length);
    if (users.length === 0) {
      hasMore = false;
      break;
    }

    for (const user of users) {
      await sendNotificationToUsers(user, notifService, data);
    }

    offset += limit;
  }

  return true;
};

export const maximumTemporaryStorageDurationScheduler = async (entityIds?: number[]) => {
  try {
    const notif = new NotificationPublisher();
    await authenticateDatabase();
    await connectRabbitMQ();
    i18next.changeLanguage(NOTIF_LANG);

    const limit = Number(LIMIT_WASTE_BAG);
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const whereEntity =
        entityIds && entityIds.length > 0
          ? `AND wb.healthcare_facility_id IN (${entityIds.join(',')})`
          : '';
      const [rows] = await sequelize.query(
        `
        SELECT 
          wb.id, 
          wb.waste_bag_qr_code_id,
          wb.created_at,
          wb.healthcare_facility_id,
          wb.healthcare_facility_name,
          wb.province_id,
          wb.province_name,
          wb.regency_id,
          wb.regency_name,
          wc.temp_storage_max_hours,
          TIMESTAMPDIFF(HOUR, wb.created_at, NOW()) AS diff_hours,
          CASE 
            WHEN wc.temp_storage_max_hours IS NULL THEN FALSE
            WHEN TIMESTAMPDIFF(HOUR, wb.created_at, NOW()) > wc.temp_storage_max_hours THEN TRUE
            ELSE FALSE
          END AS is_notif
        FROM waste_bag wb
        LEFT JOIN waste_classification wc ON wc.id = wb.waste_classification_id
        WHERE 
          wb.waste_status = 'IN_TEMPORARY_STORAGE' 
          AND wc.temp_storage_max_hours IS NOT NULL
          ${whereEntity}
        HAVING is_notif = true
        ORDER BY wb.created_at DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          replacements: { limit, offset },
        },
      );

      console.log(`== Waste Bag Batch offset ${offset}`, rows.length);

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      await getUserToNotify(rows, notif);

      offset += limit;
    }

    console.log('== DONE ALL DATA');
  } catch (error) {
    console.log('!!! Error in maximumTemporaryStorageDurationScheduler', error);
    process.exit(1);
  }
};
