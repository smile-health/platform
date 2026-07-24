import EntitySettings from '../../../domain/entities/EntitySettings';
import HealthcareModelRepository from '../../../domain/repositories/EntitySettingsRepository';

export default class GetAllEntitySettingsUseCase {
    constructor(private readonly repo: HealthcareModelRepository) {}

    async execute(
        limit: number,
        page: number,
        search: string | undefined,
        entityId: string | undefined,
    ): Promise<{
        data: EntitySettings[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const assetModel = await this.repo.getAllEntitySettingss(limit, page, search, entityId);

            console.log('Setting retrieved successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error retrieving setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
