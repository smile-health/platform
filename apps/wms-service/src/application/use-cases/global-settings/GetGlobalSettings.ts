import GlobalSettings from '../../../domain/entities/GlobalSettings';
import GlobalSettingsRepository from '../../../domain/repositories/GlobalSettingsRepository';

export default class GetGlobalSettingsUseCase {
    constructor(private readonly repo: GlobalSettingsRepository) {}

    async execute(id: string): Promise<GlobalSettings | null> {
        try {
            const data = await this.repo.getGlobalSettingsById(Number(id));
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
