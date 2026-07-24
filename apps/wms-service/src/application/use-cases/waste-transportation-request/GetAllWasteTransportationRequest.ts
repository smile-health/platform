import WasteTransportationRequest from '../../../domain/entities/WasteTransportationRequest';
import WasteTransportationRequestRepository from '../../../domain/repositories/WasteTransportationRequestRepository';

export default class GetAllWasteTransportationRequestUseCase {
    constructor(private readonly wasteSourceRepository: WasteTransportationRequestRepository) {}

    async execute(
        limit: number,
        page: number,
        search?: string,
    ): Promise<{
        data: WasteTransportationRequest[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.wasteSourceRepository.getAllWasteTransportationRequests(
                limit,
                page,
                search,
            );
            console.log('Fetched all Waste Transportation Requests successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all Waste Transportation Requests:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
