import PartnershipOperatorMap from '../../../domain/entities/PartnershipOperatorMap';
import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';

export default class GetPartnershipOperatorMapsByThirdpartyAdminUseCase {
    constructor(private readonly repo: PartnershipOperatorMapRepository) {}
    async execute(
        limit: number,
        page: number,
        token: string,
        search?: string,
        operatorId?: string,
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
            const wasteSources = await this.repo.getAllPartnershipOperatorMapsByThirdpartyAdmin(
                limit,
                page,
                token,
                search,
                operatorId,
            );
            console.log('Fetched all waste sources successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste sources:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
