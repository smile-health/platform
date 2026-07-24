import { HealthcareSelectDTO } from '../../../domain/entities/Partnership';
import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetHealthcareByThirdPartyAdminUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(token: string, entityId?: number): Promise<HealthcareSelectDTO[]> {
        try {
            const datas = await this.entity.getHealthcareByThirdPartyAdmin(token, entityId);
            console.log(`Partnerships retrieved successfully for entity ID ${entityId}:`, datas);
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
