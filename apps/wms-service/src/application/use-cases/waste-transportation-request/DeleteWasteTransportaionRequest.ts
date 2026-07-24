import WasteTransportationRequestRepository from '../../../domain/repositories/WasteTransportationRequestRepository';
import DeleteWasteTransportationRequestDTO from '../../dtos/DeleteWasteTransportationRequestDTO';

export default class DeleteWasteTransportationRequestUseCase {
    constructor(private readonly repo: WasteTransportationRequestRepository) {}

    async execute(data: DeleteWasteTransportationRequestDTO): Promise<boolean | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste source');
            }

            return await this.repo.deleteWasteTransportationRequest(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
