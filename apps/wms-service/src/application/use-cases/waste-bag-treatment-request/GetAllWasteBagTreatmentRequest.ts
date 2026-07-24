import WasteBagTreatmentRequest from '../../../domain/entities/WasteBagTreatmentRequest';
import WasteBagTreatmentRequestRepository from '../../../domain/repositories/WasteBagTreatmentRequestRepository';

export default class GetAllWasteBagTreatmentRequestUseCase {
    constructor(private readonly repository: WasteBagTreatmentRequestRepository) {}

    async execute(
        limit: number,
        page: number,
        entity_id: string | number | undefined,
        search?: string,
    ): Promise<{
        data: WasteBagTreatmentRequest[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repository.getAllWasteBagTreatmentRequests(
                limit,
                page,
                entity_id,
                search,
            );
            console.log('Fetched all waste bag treatment request successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste bag treatment request:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
