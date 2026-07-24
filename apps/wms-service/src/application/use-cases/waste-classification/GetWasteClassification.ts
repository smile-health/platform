import WasteClassification from '../../../domain/entities/WasteClassification';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';

export default class GetWasteClassificationUseCase {
    constructor(private readonly wasteClassificationRepository: WasteClassificationRepository) {}

    async execute(id: number, token?: string): Promise<WasteClassification | null> {
        try {
            const wasteClassification =
                await this.wasteClassificationRepository.getWasteClassificationById(id, token);

            return wasteClassification;
        } catch (error) {
            console.error('Error retrieving waste classification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async executeAll(
        limit: number,
        page: number,
        token: string,
        search?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        wasteCode?: string,
        useColdStorage?: boolean,
        updatedAt?: string,
        sortBy?: 'wasteCode' | 'useColdStorage' | 'updatedAt' | 'updated_at',
        sortOrder: 'ASC' | 'DESC' = 'ASC',
    ): Promise<{
        data: WasteClassification[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteClassification =
                await this.wasteClassificationRepository.getAllWasteClassification(
                    limit,
                    page,
                    token,
                    search,
                    wasteTypeId,
                    wasteGroupId,
                    wasteCharacteristicsId,
                    wasteCode,
                    useColdStorage,
                    updatedAt,
                    sortBy,
                    sortOrder
                );
            console.log('Fetched all waste classification successfully:', wasteClassification);
            return wasteClassification;
        } catch (error) {
            console.error('Error fetching all waste classification:', error);
            throw new Error('Error fetching all waste classification');
        }
    }
}
