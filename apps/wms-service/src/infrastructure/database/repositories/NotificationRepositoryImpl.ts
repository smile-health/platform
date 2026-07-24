import NotificationRepository from '../../../domain/repositories/NotificationRepository';
import NotificationModel from '../models/NotificationModel';
import Notification from '../../../domain/entities/Notification';
import { paginationUtils } from '../../../shared/utils/pagination';
import { getEntityDetail, getUsersDetail } from '../../external-apis/thirdPartyClient';
import { col, fn, Op, where } from 'sequelize';

export default class NotificationRepositoryImpl implements NotificationRepository {
  async markAllRead(entityId: number, role: string): Promise<boolean> {
    try {
      let isSuperAdmin: boolean = false;
      let isAdmin: boolean = false;
      let isOperator: boolean = false;

      if (role.includes('Operator')) {
        isOperator = true;
      } else if (role.includes('super_admin')) {
        isSuperAdmin = true;
      } else {
        isAdmin = true;
      }

      const whereClause: any = {
        entityId: entityId,
        readAt: null,
      };

      if (isSuperAdmin) {
        whereClause.forSuperAdmin = true;
      } else if (isAdmin) {
        whereClause.forAdmin = true;
      } else if (isOperator) {
        whereClause.forOperator = true;
      }

      const [affectedCount] = await NotificationModel.update(
        {
          readAt: new Date(),
          updatedAt: new Date(),
        },
        {
          where: whereClause,
        },
      );

      return affectedCount > 0;
    } catch (error) {
      console.error('Error mark all read:', error);
      throw new Error(
        'Error mark all read :' + (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  async getAllNotifications(
    limit: number,
    page: number,
    entityId: number | null,
    provinceId?: number,
    regencyId?: number,
    createdStart?: Date,
    createdEnd?: Date,
    userId?: number,
    token?: string,
    forSuperAdmin?: boolean,
    forAdmin?: boolean,
    forOperator?: boolean,
    isUnread?: boolean,
    translation?: any,
    lang?: string,
    type?: string,
  ): Promise<{
    data: Notification[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
        limit,
        page,
      });

      const whereClause: any = {
        ...(isUnread === true
          ? { readAt: null }
          : isUnread === false
            ? { readAt: { [Op.not]: null } }
            : {}),
        ...(userId && { userId: userId }),
        ...(provinceId && { provinceId: provinceId }),
        ...(regencyId && { regencyId: regencyId }),
        ...(createdStart &&
          createdEnd && {
            createdAt: where(fn('CONVERT_TZ', col('created_at'), '+00:00', '+07:00'), {
              [Op.gte]: createdStart,
              [Op.lt]: createdEnd,
            }),
          }),
        ...(type && { type: type }),
      };

      if (forSuperAdmin) {
        // Super admin bisa lihat semua data
        whereClause.forSuperAdmin = forSuperAdmin;
      } else if (forAdmin) {
        // Admin bisa lihat: data dengan entityId mereka ATAU notifikasi global
        whereClause.forAdmin = forAdmin;
        // whereClause[Op.or] = [
        //   ...(entityId ? [{ entityId: entityId }] : []), // Notifikasi lokal untuk admin
        //   {
        //     type: {
        //       [Op.and]: ['waste_classification.deleted', 'waste_hierarchy.deleted'],
        //     },
        //     // Tidak ada filter entityId = notifikasi global
        //   },
        // ];
      } else if (forOperator) {
        // Operator hanya lihat data dengan entityId mereka
        whereClause.forOperator = forOperator;
        whereClause.entityId = entityId;
      } else {
        // Default: hanya data dengan entityId yang sesuai
        whereClause.entityId = entityId;
      }
      if (entityId) whereClause.entityId = entityId;

      const { count, rows } = await NotificationModel.findAndCountAll({
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit,
        order: [['created_at', 'DESC']],
        distinct: true,
        where: whereClause,
      });

      return paginationUtils.formatPaginationResult(
        await Promise.all(
          rows.map(async (model: NotificationModel) => {
            return await getModel(model, token!, translation, lang);
          }),
        ),
        Number(count),
        safeLimit,
        safePage,
      );
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      throw new Error('Error retrieving notifications');
    }
  }

  async getNotificationCount(
    entityId: number,
    userId?: number,
    token?: string,
    forSuperAdmin?: boolean,
    forAdmin?: boolean,
    forOperator?: boolean,
  ): Promise<number> {
    try {
      const whereClause: any = {
        entityId: entityId,
        // userId: userId,
        readAt: null, // Only count unread notifications
        ...(forSuperAdmin && {
          forSuperAdmin: forSuperAdmin,
        }),
        ...(forAdmin && {
          forAdmin: forAdmin,
        }),
        ...(forOperator && {
          forOperator: forOperator,
        }),
      };

      const count = await NotificationModel.count({
        where: whereClause,
      });

      return count;
    } catch (error) {
      console.error('Error counting notifications:', error);
      throw new Error('Error counting notifications');
    }
  }

  async markAsRead(id: number): Promise<boolean> {
    try {
      const [affectedCount] = await NotificationModel.update(
        {
          readAt: new Date(),
          updatedAt: new Date(),
        },
        {
          where: {
            id: id,
          },
        },
      );

      return affectedCount > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Error marking notification as read');
    }
  }
}

const isJsonObject = (str?: string) => {
  try {
    if (!str) return false;
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
};

async function getModel(
  data: NotificationModel,
  token: string,
  translation: any,
  lang?: string,
): Promise<Notification> {
  const result = data.get({ plain: true });

  const dataEntity = await getEntityDetail(result.entityId, token);
  const dataUser = await getUsersDetail(result.userId.toString(), token);

  const fullName = [dataUser?.firstname, dataUser?.lastname].filter(Boolean).join(' ');
  const dataMessage = isJsonObject(result.message) ? JSON.parse(result.message || '{}') : {};
  const title = isJsonObject(result.message) ? translation(result.title) : result.title;
  const message = isJsonObject(result.message)
    ? translation(result.type, {
        ...dataMessage,
        entity_name: dataEntity?.name,
        regency_name: dataEntity.regency_name,
        ...(result.type === 'notification.waste_generartion_below_monthly_projection.message'
          ? {
              waste_characteristic:
                lang === 'id' ? dataMessage.waste_fullname : dataMessage.waste_fullname_en,
            }
          : {}),
      })
    : result.message;

  return new Notification({
    id: result.id || data.id,
    message: message,
    userId: result.userId,
    provinceId: result.provinceId,
    regencyId: result.regencyId,
    entityId: result.entityId,
    media: result.media,
    title: title,
    type: result.type,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    readAt: result.readAt,
    mobilePhone: result.mobilePhone,
    actionUrl: result.actionUrl,
    downloadUrl: result.downloadUrl,
    patientId: result.patientId,
    programId: result.programId,
    forSuperAdmin: result.forSuperAdmin,
    forAdmin: result.forAdmin,
    forOperator: result.forOperator,
    userName: fullName,
    entityName: dataEntity?.name,
  });
}
