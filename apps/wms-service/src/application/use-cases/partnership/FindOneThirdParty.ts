import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class FindOneThirdPartyUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(
        healthcareFacilityId: number,
        transporterId: number,
        wasteClassificationId: number[],
    ): Promise<any[]> {
        try {
            const datas = await this.entity.findOneThirdParty(
                healthcareFacilityId,
                transporterId,
                wasteClassificationId,
            );
            console.log(
                `Partnerships waste classification retrieved successfully for entity ID ${transporterId}:`,
                datas,
            );
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships waste classification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
