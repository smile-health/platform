import Notification from '../entities/Notification';

export default interface NotificationRepository {
  getAllNotifications(
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
  }>;

  getNotificationCount(
    entityId: number,
    userId?: number,
    token?: string,
    forSuperAdmin?: boolean,
    forAdmin?: boolean,
    forOperator?: boolean,
  ): Promise<number>;

  markAsRead(id: number): Promise<boolean>;

  markAllRead(userId: number, role: string): Promise<boolean>;
}
