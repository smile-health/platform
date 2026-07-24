import EntityRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetHasMultiplePartnershipUseCase {
    constructor(private readonly entity: EntityRepository) {}

    async execute(
        healthcareFacilityId: number,
        wasteClassificationId: number[],
    ): Promise<any[]> {
        try {
            const datas = await this.entity.getHasMultiplePartnership(
                healthcareFacilityId,
                wasteClassificationId,
            );
            console.log(
                `Partnerships waste classification retrieved successfully for entity ID ${healthcareFacilityId}:`,
                datas,
            );
            return datas;
        } catch (error) {
            console.error('Error retrieving Partnerships waste classification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
