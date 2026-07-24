import { PartnershipSelectDTO } from '../../../domain/entities/Partnership';
import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetPartnershipByThirdPartyAdminUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(
        token: string,
        entityId?: number,
        entityTag?: string,
    ): Promise<PartnershipSelectDTO[]> {
        try {
            const datas = await this.entity.getPartnershipByThirdPartyAdmin(
                token,
                entityId,
                entityTag,
            );
            console.log(`Partnerships retrieved successfully for entity ID ${entityId}:`, datas);
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
