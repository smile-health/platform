import i18next from 'i18next';
import '../../../interfaces/http/middlewares/i18n';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { authenticateDatabase, sequelize } from '../../../infrastructure/database/db.connection';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';
import { connectRabbitMQ } from '../../../infrastructure/queue/rabbitmq/rabbitmq';
import { NOTIFICATION_MEDIA, NOTIFICATION_WORKER } from '../../../shared/types/notificationTypes';

const EMAIL_LANG = process.env.EMAIL_LANG || 'id';
const LIMIT_WASTE_BAG = process.env.LIMIT_CRON_INACTIVE_USER_WASTE_BAG || 10;
const LIMIT_USER = process.env.LIMIT_CRON_INACTIVE_USER || 1;

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
  entity_type: number;
}

interface WasteBagSummary {
  province_id: number | null;
  regency_id: number | null;
  district_id: number | null;
  healthcare_facility_id: number | null;

  last_created_at: Date | string; // tergantung driver DB
  age_days: number;

  entity_name: string | null;
  regency_name: string | null;
}

const stateNotif: {
  [key: number]: { for_super_admin: boolean; for_admin: boolean; for_operator: boolean };
} = {
  1: { for_super_admin: true, for_admin: true, for_operator: true },
  2: { for_super_admin: false, for_admin: true, for_operator: true },
  3: { for_super_admin: false, for_admin: false, for_operator: true },
};

const conditionDataInactiveUsers: { [key: number]: string } = {
  1: 'AND wb.province_id = :provinceId',
  2: 'AND wb.regency_id = :regencyId',
  3: 'AND wb.healthcare_facility_id = :entityId',
};

function getCurrentDateAndFulltime(): { date: string; fulltime: string } {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const fulltime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  const date = `${day}/${month}/${year}`;

  return { date, fulltime };
}

const sendEmailToInactiveUsers = async (
  user: UserToNotif,
  notifService: NotificationServiceRepository,
  data: WasteBagSummary[],
) => {
  let content = emailTemplateHTML(
    i18next.t('notification.inactive_entity.title'),
    data.map((item) => {
      return {
        message: i18next.t('notification.inactive_entity.message', {
          entity_name: item.entity_name,
          regency_name: item.regency_name,
          age_days: item.age_days,
        }),
      };
    }),
  );

  await notifService.processNotification({
    user: {
      user_id: user.id,
      email: user.email,
      mobile_phone: user.mobile_phone,
      entity_id: user.entity_id,
      province_id: user.province_id || null,
      regency_id: user.regency_id || null,
    },
    message: '',
    title: i18next.t('notification.inactive_entity.recap_title'),
    type: 'notification.inactive_entity.message',
    mail: user.email,
    subject: i18next.t('notification.inactive_entity.recap_title'),
    content,
    worker: NOTIFICATION_WORKER.EMAIL,
    workerMedia: NOTIFICATION_MEDIA.EMAIL,
    ...stateNotif[user.entity_type],
  });
};

const getDataInactiveUsers = async (
  user: UserToNotif,
  notifService: NotificationServiceRepository,
) => {
  const ageDays = [7, 14, 21, 28, 35, 42, 49, 56];
  const limit = Number(LIMIT_WASTE_BAG);
  let offset = 0;
  let hasMore = true;

  const condition = conditionDataInactiveUsers[user.entity_type];
  if (!condition) return;

  while (hasMore) {
    const [rows] = (await sequelize.query(
      `
          SELECT 
              wb.province_id, 
              wb.regency_id, 
              wb.district_id, 
              wb.healthcare_facility_id,
              MAX(wb.created_at) AS last_created_at,
              TIMESTAMPDIFF(DAY, MAX(wb.created_at), NOW()) AS age_days,
              e.name AS entity_name,
              e.regency_name,
              e.name AS entity_name
          FROM waste_bag wb
          LEFT JOIN entities e ON wb.healthcare_facility_id = e.id
          WHERE wb.created_at >= NOW() - INTERVAL 56 DAY ${condition}
          GROUP BY 
              wb.province_id, 
              wb.regency_id, 
              wb.district_id, 
              wb.healthcare_facility_id
          HAVING age_days IN (:ageDays)
          ORDER BY wb.healthcare_facility_id ASC
          LIMIT :limit OFFSET :offset
          `,
      {
        replacements: {
          provinceId: user.province_id,
          regencyId: user.regency_id,
          entityId: user.entity_id,
          user,
          limit,
          offset,
          ageDays,
        },
      },
    )) as WasteBagSummary[][];

    console.log(`--- Waste Bag Batch offset ${offset}`, rows.length);

    if (rows.length === 0) {
      hasMore = false;
      break;
    }

    await sendEmailToInactiveUsers(user, notifService, rows);

    offset += limit;
  }

  return true;
};

export const recapEmailInActiveUserScheduler = async (entityIds?: number[]) => {
  try {
    const notif = new NotificationPublisher();
    await authenticateDatabase();
    await connectRabbitMQ();
    i18next.changeLanguage(EMAIL_LANG);

    const limit = Number(LIMIT_USER);
    let offset = 0;
    let hasMore = true;

    const whereClause =
      entityIds && entityIds.length > 0 ? ` AND u.entity_id IN (${entityIds.join(',')})` : '';

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
            e.type AS entity_type
        FROM users u
        LEFT JOIN entities e ON u.entity_id = e.id
        WHERE 1=1 
        AND u.is_active = 1
        AND u.deleted_at IS NULL
        ${whereClause}
        LIMIT :limit OFFSET :offset
    `,
        {
          replacements: { limit, offset },
        },
      )) as UserToNotif[][];

      console.log(`== User Batch offset ${offset}`, users.length);
      if (users.length === 0) {
        hasMore = false;
        break;
      }

      for (const user of users) {
        await getDataInactiveUsers(user, notif);
      }

      offset += limit;
    }
  } catch (error) {
    console.log('!!! Error in inActiveUserScheduler', error);
    process.exit(1);
  }
};

function emailTemplateHTML(
  title: string,
  data: {
    message: string | null;
  }[] = [],
) {
  const { date } = getCurrentDateAndFulltime();
  let listContent = `
    <div class="section">
      <h2 class="section-title">${title}</h2>
      <table style="width:100%" class="event-item">`;

  for (const item of data) {
    const { fulltime } = getCurrentDateAndFulltime();
    listContent += `
        <tr>
          <td>${fulltime} - ${item.message}</td>
        </tr>`;
  }

  listContent += `
      </table>
    </div>
    `;
  const content = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Events Report - SMILE</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        background-color: #9e9e9e;
      }
      table,
      th,
      td {
        border-collapse: collapse;
        padding: 12px 15px;
        color: #0C3045;
        border: 1px #D4D4D4 solid;
        background-color: #E2F3FC;
        font-size: 16px;
      }
 
      .email-container {
        max-width: 900px;
        margin: 0 auto;
        background-color: #ffffff;
      }
 
      .header {
        background: #E2F3FC;
        padding: 40px 50px;
        text-align: center;
      }
 
      .logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
 
      .logo-image {
        width: 126px;
      }
 
      .content {
        padding: 40px 50px;
        background-color: #ffffff;
      }
 
      .main-title {
        font-size: 30px;
        font-weight: 600;
        color: #0C3045;
        margin: 0 0 40px 0;
      }
 
      .section {
        margin-bottom: 40px;
      }
 
      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: #0C3045;
        margin: 0 0 15px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #bdc3c7;
      }
 
      .empty-section {
        height: 40px;
        background-color: #F5F5F4;
      }
 
      .footer {
        background-color: #ffffff;
        padding: 30px 50px;
        text-align: center;
        color: #073B4C;
        font-size: 16px;
        font-weight: 400;
      }
 
      @media only screen and (max-width: 600px) {
        .email-container {
          border: none;
          margin: 0;
        }
 
        .header,
        .content,
        .footer {
          padding: 20px;
        }
 
        .main-title {
          font-size: 24px;
        }
 
        .section-title {
          font-size: 18px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <img class="logo-image" alt="logo" src="https://smile.kemkes.go.id/images/logo-smile.svg">
        </div>
      </div>
      <!-- Content -->
      <div class="content">
        <h1 class="main-title">Events on ${date}</h1>
        <!-- Content List Notifications -->
        ${listContent}
      </div>
      <!-- Footer -->
      <div class="footer"> © 2025 SMILE | UNDP </div>
    </div>
  </body>
</html>
  `;
  return content;
}
