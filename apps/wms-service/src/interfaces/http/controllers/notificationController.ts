import { Request, Response } from 'express';
import GetAllNotificationUseCase from '../../../application/use-cases/notification/GetAllUseCase';
import GetCountNotificationByIdUseCase from '../../../application/use-cases/notification/GetCountUseCase';
import MarkAllReadNotificationByIdUseCase from '../../../application/use-cases/notification/MarkAllReadUseCase';
import MarkAsReadNotificationByIdUseCase from '../../../application/use-cases/notification/MarkAsReadUseCase';
import NotificationRepositoryImpl from '../../../infrastructure/database/repositories/NotificationRepositoryImpl';
import { isAdmin, isManager, isOperator, isSuperAdmin } from '../../../shared/utils/role';
import { inActiveUserScheduler } from '../../schedulers/jobs/inActiveUserScheduler';
import { recapEmailInActiveUserScheduler } from '../../schedulers/jobs/recapEmailInActiveUserScheduler';
import { maximumTemporaryStorageDurationScheduler } from '../../schedulers/jobs/maximumTemporaryStorageDurationScheduler';
import { wasteGenerationBelowMonthlyProjectionScheduler } from '../../schedulers/jobs/wasteGenerationBelowMonthlyProjectionScheduler';
import { NOTIFICATION_TYPE } from '../../../shared/utils/dictionary';
import { updateStatusManualWeighingApprovalScheduler } from '../../schedulers/jobs/updateStatusManualWeighingApprovalScheduler';

const getEntityFilter = (
  role: string | null,
  entityIdFilter: string | null,
  entityIdUser: number | null,
): number | null => {
  if (isSuperAdmin(role!)) {
    return entityIdFilter !== null ? Number(entityIdFilter) : null; // Super admin can access all entities, so no filter needed
  } else if (isManager(role!)) {
    return entityIdUser; // manager can access all entities, so no filter needed
  } else if (isAdmin(role!)) {
    return entityIdFilter !== null ? Number(entityIdFilter) : null; // Admin can access all entities, so no filter needed
  } else if (isOperator(role!)) {
    return entityIdUser; // Operator can access all entities, so no filter needed
  } else {
    return entityIdUser; // For admin and operator, use the provided entityIdFilter or fallback to user's entity ID
  }
};
export async function getAllNotif(req: Request, res: Response): Promise<void> {
  try {
    const repo = new NotificationRepositoryImpl();
    const useCase = new GetAllNotificationUseCase(repo);

    const {
      limit,
      page,
      userId,
      provinceId,
      regencyId,
      entityId,
      createdStart,
      createdEnd,
      isUnread,
      type,
    } = req.query;
    const entityIdFilter = entityId ? entityId.toString() : null;
    const entityIdUser = req.user?.entity.id ? Number(req.user.entity.id) : null;
    const token = req.headers['authorization']?.split(' ')[1];
    const lang = req.headers['accept-language'];
    const role = req.user?.external_properties?.role.type ?? '';
    const startDate = createdStart
      ? new Date(new Date(createdStart.toString()).setHours(0, 0, 0, 0))
      : undefined;

    const endDate = createdEnd
      ? new Date(new Date(createdEnd.toString()).setHours(23, 59, 59, 999))
      : undefined;

    const notifications = await useCase.execute(
      Number(limit) || 10,
      Number(page) || 1,
      getEntityFilter(role, entityIdFilter, entityIdUser),
      Number(provinceId),
      Number(regencyId),
      startDate,
      endDate,
      Number(userId?.toString()),
      token,
      isSuperAdmin(role),
      isAdmin(role),
      isOperator(role),
      isUnread ? isUnread?.toString() === 'false' : undefined,
      req.t,
      lang,
      type ? type.toString() : undefined,
    );

    const formatData = notifications.data.map((item) => {
      return {
        ...item,
        message: item.message,
        title: item.title,
      };
    });

    res.success({
      data: formatData,
      pagination: {
        total: notifications.pagination.total,
        pages: notifications.pagination.pages,
        currentPage: notifications.pagination.currentPage,
        perPage: notifications.pagination.perPage,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function getTotalCount(req: Request, res: Response): Promise<void> {
  try {
    const repo = new NotificationRepositoryImpl();
    const useCase = new GetCountNotificationByIdUseCase(repo);

    const entityId = Number(req.user?.entity.id);
    const userId = Number(req.user?.id);
    const token = req.headers['authorization']?.split(' ')[1];
    const role = req.user?.external_properties?.role.type ?? '';

    const count = await useCase.execute(
      entityId,
      userId,
      token,
      isSuperAdmin(role),
      isAdmin(role),
      isOperator(role),
    );

    res.success({ total: count });
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const notificationId = Number(req.params.id);

    if (!notificationId) {
      res.error('Invalid notification ID or user ID');
      return;
    }

    const repo = new NotificationRepositoryImpl();
    const useCase = new MarkAsReadNotificationByIdUseCase(repo);
    const result = await useCase.execute(notificationId);

    if (!result) {
      res.fail({ message: 'Notification not found' });
      return;
    }
    res.success({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  try {
    const role = req.user?.external_roles;
    const entityId = Number(req.user?.entity.id);

    if (!role) {
      res.error('External roles is invalid');
      return;
    }

    if (!entityId) {
      res.error('Entity ID is missing');
      return;
    }

    const repo = new NotificationRepositoryImpl();
    const useCase = new MarkAllReadNotificationByIdUseCase(repo);
    await useCase.execute(entityId, role?.toString());

    res.success({ message: 'All notification marked as read' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function triggerInactiveUserNotification(req: Request, res: Response): Promise<void> {
  try {
    const entityIds = req.body ? req.body.entityIds : [];
    inActiveUserScheduler(entityIds);
    res.success({ message: 'Inactive user notification triggered' });
  } catch (error) {
    res.error(req.t('common.server-error'));
  }
}

export async function triggerEmailInactiveUserNotification(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const entityIds = req.body ? req.body.entityIds : [];
    recapEmailInActiveUserScheduler(entityIds);
    res.success({ message: 'Email inactive user notification triggered' });
  } catch (error) {
    res.error(req.t('common.server-error'));
  }
}

export async function triggerMaximumTemporaryStorageNotification(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const entityIds = req.body ? req.body.entityIds : [];
    maximumTemporaryStorageDurationScheduler(entityIds);
    res.success({ message: 'Maximum temporary storage notification triggered' });
  } catch (error) {
    res.error(req.t('common.server-error'));
  }
}

export async function triggerWasteGenerationBelowMonthlyProjectionNotification(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const entityIds = req.body ? req.body.entityIds : [];
    wasteGenerationBelowMonthlyProjectionScheduler(entityIds);
    res.success({ message: 'Waste generation below monthly projection notification triggered' });
  } catch (error) {
    res.error(req.t('common.server-error'));
  }
}

export async function triggerUpdateStatusManualWeighingApprovalNotification(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const entityIds = req.body ? req.body.entityIds : [];
    updateStatusManualWeighingApprovalScheduler(entityIds);
    res.success({ message: 'Update status manual weighing approval notification triggered' });
  } catch (error) {
    res.error(req.t('common.server-error'));
  }
}

export async function getTypeNotif(req: Request, res: Response): Promise<void> {
  try {
    res.success({
      data: NOTIFICATION_TYPE.map((item) => ({
        id: item.id,
        title: /^notification\..*\.message$/.test(item.type)
          ? req.t(item.type.replace('.message', '.title'))
          : req.t(item.type),
        type: item.type,
      })),
      pagination: {
        total: NOTIFICATION_TYPE.length,
        pages: 1,
        currentPage: 1,
        perPage: 100,
      },
    });
  } catch (error) {
    res.error(req.t('common.server-error'));
  }
}
