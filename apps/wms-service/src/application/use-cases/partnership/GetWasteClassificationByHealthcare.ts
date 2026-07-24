import { WasteClassificationSelectDTO } from '../../../domain/entities/Partnership';
import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetWasteClassificationByHealthcareUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(
        consumerId: number,
        providerId: number,
        isSameCompany?: number,
    ): Promise<WasteClassificationSelectDTO[]> {
        try {
            const datas = await this.entity.getWasteClassificationByHealthcare(
                consumerId,
                providerId,
                isSameCompany,
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
