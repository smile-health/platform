import EntitySettings from '../../../domain/entities/EntitySettings';
import HealthcareModelRepository from '../../../domain/repositories/EntitySettingsRepository';

export default class GetEntitySettingsUseCase {
    constructor(private readonly repo: HealthcareModelRepository) {}

    async execute(id: string): Promise<EntitySettings | null> {
        try {
            const data = await this.repo.getEntitySettingsById(Number(id));
            if (!data) {
                console.error(`Setting with ID ${id} not found`);
                return null;
            }
            console.log('Setting retrieved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
