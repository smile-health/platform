import PartnershipVehicleMap from '../../../domain/entities/PartnershipVehicleMap';
import PartnershipVehicleMapRepository from '../../../domain/repositories/PartnershipVehicleMapRepository';

export default class GetAllPartnershipVehicleMapUseCase {
    constructor(private readonly repo: PartnershipVehicleMapRepository) {}

    async execute(
        limit: number,
        page: number,
        search?: string,
    ): Promise<{
        data: PartnershipVehicleMap[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repo.getAllPartnershipVehicleMaps(limit, page, search);
            console.log('Fetched all waste sources successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
