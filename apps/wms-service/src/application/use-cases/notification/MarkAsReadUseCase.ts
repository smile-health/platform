import NotificationRepository from '../../../domain/repositories/NotificationRepository';

export default class MarkAsReadNotificationByIdUseCase {
    constructor(private readonly repo: NotificationRepository) {}

    async execute(id: number): Promise<boolean> {
        try {
            const data = await this.repo.markAsRead(id);

            return data;
        } catch (error) {
            console.error('Error update data:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
