import Notification from '../../../domain/entities/Notification';
import NotificationRepository from '../../../domain/repositories/NotificationRepository';

export default class GetAllNotificationUseCase {
  constructor(private readonly partnerVehicleRepository: NotificationRepository) {}

  async execute(
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
      const data = await this.partnerVehicleRepository.getAllNotifications(
        limit,
        page,
        entityId,
        provinceId,
        regencyId,
        createdStart,
        createdEnd,
        userId,
        token,
        forSuperAdmin,
        forAdmin,
        forOperator,
        isUnread,
        translation,
        lang,
        type,
      );
      return data;
    } catch (error) {
      console.error('Error retrieving Data:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
