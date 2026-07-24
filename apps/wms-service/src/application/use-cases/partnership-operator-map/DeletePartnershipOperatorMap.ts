import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';

export default class DeletePartnershipOperatorMapUseCase {
    constructor(private readonly repo: PartnershipOperatorMapRepository) {}

    async execute(partnershipId: number, operatorId: string, deletedBy?: number): Promise<boolean | null> {
        try {
            if (!partnershipId || !operatorId) {
                throw new Error(
                    'partnershipId and operatorId is required to delete a waste source',
                );
            }

            return await this.repo.deletePartnershipOperatorMap(partnershipId, operatorId, deletedBy);
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
