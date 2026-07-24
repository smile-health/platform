import Partnership from '../../../domain/entities/Partnership';
import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetPatrnershipByUserIdUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(
        limit: number = 10,
        page: number = 1,
        entityId: number | undefined,
        entityTag: string | undefined,
        token: string,
        search?: string,
        providerId?: number,
        consumerId?: number,
        wasteClassificationId?: number,
        partnershipStatus?: string,
    ): Promise<{
        data: Partnership[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const datas = await this.entity.getAllPartnershipByUserId(
                limit,
                page,
                entityId,
                entityTag,
                token,
                search,
                providerId,
                consumerId,
                wasteClassificationId,
                partnershipStatus
            );
            console.log(`Partnerships retrieved successfully for entity ID ${entityId}:`, datas);
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
