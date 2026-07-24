import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';
import DeleteWasteTransportationGroupDTO from '../../dtos/DeleteWasteTransportationGroupDTO';

export default class DeleteWasteTransportationGroupUseCase {
    constructor(private readonly wasteSourceRepository: WasteTransportationGroupRepository) {}

    async execute(data: DeleteWasteTransportationGroupDTO): Promise<boolean | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste source');
            }

            return await this.wasteSourceRepository.deleteWasteTransportationGroup(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
