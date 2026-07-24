import EntityRepository from '../../../domain/repositories/PartnershipRepository';
import DeleteEntityDTO from '../../dtos/DeletePartnershipDTO';

export default class DeleteWasteSourceUseCase {
    constructor(private readonly model: EntityRepository) {}

    async execute(data: DeleteEntityDTO): Promise<boolean> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste source');
            }

            return await this.model.deletePartnership(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
