import WasteBagTreatmentRequestRepository from '../../../domain/repositories/WasteBagTreatmentRequestRepository';
import DeleteWasteBagTreatmentRequestDTO from '../../dtos/DeleteWasteBagTreatmentRequestDTO';

export default class DeleteWasteBagTreatmentRequestUseCase {
    constructor(
        private readonly wasteBagTreatmentRequestRepository: WasteBagTreatmentRequestRepository,
    ) {}

    async execute(data: DeleteWasteBagTreatmentRequestDTO): Promise<boolean | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste bag qr code');
            }

            return await this.wasteBagTreatmentRequestRepository.deleteWasteBagTreatmentRequest(
                id.toString(),
                data.deletedBy,
            );
        } catch (error) {
            console.error('Error deleting waste bag treatment request:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
