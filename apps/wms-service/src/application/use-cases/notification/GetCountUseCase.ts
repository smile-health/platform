import NotificationRepository from '../../../domain/repositories/NotificationRepository';

export default class GetCountNotificationByIdUseCase {
    constructor(private readonly repo: NotificationRepository) {}

    async execute(
        entityId: number,
        userId?: number,
        token?: string,
        forSuperAdmin?: boolean,
        forAdmin?: boolean,
        forOperator?: boolean,
    ): Promise<number> {
        try {
            const data = await this.repo.getNotificationCount(
                entityId,
                userId,
                token,
                forSuperAdmin,
                forAdmin,
                forOperator,
            );

            return data;
        } catch (error) {
            console.error('Error count notification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
