import GlobalSettingsRepository from '../../../domain/repositories/GlobalSettingsRepository';

export default class DeleteGlobalSettingsUseCase {
    constructor(private readonly assetModelRepository: GlobalSettingsRepository) {}

    async execute(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            if (!id) {
                throw new Error('ID is required to delete an global settings');
            }

            return await this.assetModelRepository.deleteGlobalSettings(id, deletedBy);
        } catch (error) {
            console.error('Error deleting global settings:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
