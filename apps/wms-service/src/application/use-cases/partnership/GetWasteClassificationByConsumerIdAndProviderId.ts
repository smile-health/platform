import { PartnershipWasteClassification } from '../../../domain/entities/Partnership';
import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetWasteClassificationByConsumerIdAndProviderIdUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(
        limit: number,
        page: number,
        providerId: number,
        consumerId: number,
    ): Promise<{
        data: PartnershipWasteClassification[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const datas = await this.entity.getWasteClassificationByConsumerIdAndProviderId(
                limit,
                page,
                providerId,
                consumerId,
            );
            console.log(
                `Partnerships waste classification retrieved successfully for entity ID ${consumerId}:`,
                datas,
            );
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships waste classification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
