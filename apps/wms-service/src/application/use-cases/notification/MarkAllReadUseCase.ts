import NotificationRepository from '../../../domain/repositories/NotificationRepository';

export default class MarkAllReadNotificationByIdUseCase {
    constructor(private readonly repo: NotificationRepository) {}

    async execute(userId: number, role: string): Promise<boolean> {
        try {
            const data = await this.repo.markAllRead(userId, role);

            return data;
        } catch (error) {
            console.error('Error update data:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
