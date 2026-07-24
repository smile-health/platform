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

function formatWeight(value: number | string) {
  if (value === null || value === undefined || value === '') return '0';

  let num;

  if (typeof value === 'number') {
    num = value;
  } else {
    const str = String(value);

    // kalau ada koma → kemungkinan format ID (1.234,56)
    if (str.includes(',')) {
      num = Number(str.replace(/\./g, '').replace(',', '.'));
    }
    // kalau ada titik → bisa desimal biasa (29.00)
    else {
      num = Number(str);
    }
  }

  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

const getHalfMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return {
    start_date: `${year}-${month}-01 00:00:00`,
    end_date: `${year}-${month}-15 23:59:59`,
  };
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
      message: JSON.stringify({
        ...item,
        total_weight: formatWeight(item.total_weight),
        projection_weight: formatWeight(item.projection_weight),
        avg_weight: formatWeight(item.avg_weight),
      }),
      title: 'notification.waste_generartion_below_monthly_projection.title',
      titleTranslation: translateString(
        'notification.waste_generartion_below_monthly_projection.title',
      ),
      messageTranslation: translateString(
        'notification.waste_generartion_below_monthly_projection.message',
        {
          ...item,
          total_weight: formatWeight(item.total_weight),
          projection_weight: formatWeight(item.projection_weight),
          avg_weight: formatWeight(item.avg_weight),
          waste_characteristic: NOTIF_LANG === 'id' ? item.waste_fullname : item.waste_fullname_en,
        },
      ),
      type: 'notification.waste_generartion_below_monthly_projection.message',
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

export const wasteGenerationBelowMonthlyProjectionScheduler = async (entityIds?: number[]) => {
  try {
    const notif = new NotificationPublisher();
    await authenticateDatabase();
    await connectRabbitMQ();
    i18next.changeLanguage(NOTIF_LANG);

    const { start_date, end_date } = getHalfMonthRange();
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
            wb.healthcare_facility_id,
            wb.regency_id,
            wb.province_id,
            et.province_name,
            et.regency_name,
            et.name AS entity_name,
            CONCAT(wt.name, ' - ', wg.name, ' - ', wch.name) AS waste_fullname,
            CONCAT(wt.name_en, ' - ', wg.name_en, ' - ', wch.name_en) AS waste_fullname_en,
            COALESCE(SUM(wb.weight_in_kgs), 0) AS total_weight,
            COALESCE(ROUND(prev.avgWeightPrev3Months / 2, 2), 0) AS projection_weight,
            COALESCE(ROUND(prev.avgWeightPrev3Months, 2), 0) AS avg_weight
        FROM waste_bag wb
        JOIN waste_classification wc ON wc.id = wb.waste_classification_id
        JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
        JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
        JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
        LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
        LEFT JOIN (
          SELECT 
              monthly.healthcare_facility_id,
              monthly.waste_characteristics_id,
              AVG(monthly.totalWeight) AS avgWeightPrev3Months
          FROM (
              SELECT 
                  wb2.healthcare_facility_id,
                  wc2.waste_characteristics_id,
                  DATE_FORMAT(wb2.created_at, '%Y-%m') AS monthLabel,
                  COUNT(*) AS totalBags,
                  COALESCE(SUM(wb2.weight_in_kgs), 0) AS totalWeight
              FROM waste_bag wb2
              JOIN waste_classification wc2 ON wc2.id = wb2.waste_classification_id
              WHERE CONVERT_TZ(wb2.created_at,'+00:00','+07:00') >= DATE_SUB(:start_date, INTERVAL 3 MONTH)
                      AND CONVERT_TZ(wb2.created_at,'+00:00','+07:00') < :start_date
              GROUP BY wb2.healthcare_facility_id, wc2.waste_characteristics_id, monthLabel
          ) AS monthly
          GROUP BY monthly.healthcare_facility_id, monthly.waste_characteristics_id
        ) AS prev 
            ON prev.healthcare_facility_id = wb.healthcare_facility_id 
            AND prev.waste_characteristics_id = wc.waste_characteristics_id
        WHERE 
        CONVERT_TZ(wb.created_at,'+00:00','+07:00') BETWEEN :start_date AND :end_date 
        ${whereEntity}
        GROUP BY wb.healthcare_facility_id, wc.waste_characteristics_id
        HAVING total_weight < projection_weight
        ORDER BY et.province_name ASC, et.name ASC, waste_fullname ASC
        LIMIT :limit OFFSET :offset
        `,
        {
          replacements: { limit, offset, start_date, end_date },
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
    console.log('!!! Error in wasteGenerationBelowMonthlyProjectionScheduler', error);
    process.exit(1);
  }
};
