import EntitySettingsRepository from '../../../domain/repositories/EntitySettingsRepository';

export default class DeleteEntitySettingsUseCase {
    constructor(private readonly assetModelRepository: EntitySettingsRepository) {}

    async execute(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            if (!id) {
                throw new Error('ID is required to delete an partner vehicle');
            }

            return await this.assetModelRepository.deleteEntitySettings(id, deletedBy);
        } catch (error) {
            console.error('Error deleting partner vehicle:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
