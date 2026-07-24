import GlobalSettings from '../../../domain/entities/GlobalSettings';
import GlobalSettingsRepository from '../../../domain/repositories/GlobalSettingsRepository';

export default class GetAllGlobalSettingsUseCase {
    constructor(private readonly repo: GlobalSettingsRepository) {}

    async execute(
        limit: number,
        page: number,
        search: string | undefined,
    ): Promise<{
        data: GlobalSettings[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const assetModel = await this.repo.getAllGlobalSettingss(limit, page, search);

            console.log('Setting retrieved successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error retrieving setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
