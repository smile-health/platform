import PartnershipOperatorMap from '../../../domain/entities/PartnershipOperatorMap';
import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';

export default class GetPartnershipOperatorMapUseCase {
    constructor(private readonly repo: PartnershipOperatorMapRepository) {}

    async execute(
        limit: number,
        page: number,
        token: string,
        providerId: number,
        search?: string,
        partnershipId?: number,
    ): Promise<{
        data: PartnershipOperatorMap[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repo.getAllPartnershipOperatorMaps(
                limit,
                page,
                token,
                providerId,
                search,
                partnershipId,
            );
            console.log('Fetched all waste sources successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
