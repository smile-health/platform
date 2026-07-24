import Partnership from '../../../domain/entities/Partnership';
import PartnershipRepository from '../../../domain/repositories/PartnershipRepository';

export default class GetPartnershipUseCase {
    constructor(private readonly partnership: PartnershipRepository) {}

    async execute(id: string, token: string): Promise<Partnership | null> {
        try {
            const data = await this.partnership.getPartnershipById(id, token);
            if (!data) {
                console.error(`Partnership with ID ${id} not found`);
                return null;
            }
            console.log('Partnership retrieved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving Partnership:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
