import WasteSource from '../../../domain/entities/WasteSource';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';

export default class GetAllWasteSourceUseCase {
    constructor(private readonly wasteSourceRepository: WasteSourceRepository) {}

    async execute(
        limit: number,
        page: number,
        token: string,
        entityId: number,
        search?: string,
        sourceType?: string,
    ): Promise<{
        data: WasteSource[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.wasteSourceRepository.getAllWasteSources(
                limit,
                page,
                token,
                entityId,
                search,
                sourceType,
            );
            console.log('Fetched all waste sources successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
