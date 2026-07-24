import { OperatorsSelectDTO } from '../../../domain/entities/PartnershipOperatorMap';
import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';

export default class GetOperatorsFromOperatorMapUseCase {
    constructor(private readonly entity: PartnershipOperatorMapRepository) {}

    async execute(token: string, entityId?: number): Promise<OperatorsSelectDTO[]> {
        try {
            const datas = await this.entity.getOperatorsFromOperatorMap(token, entityId);
            console.log(
                `Partnerships operator map retrieved successfully for entity ID ${entityId}:`,
                datas,
            );
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships operator map:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
