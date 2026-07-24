import WasteBagTreatmentRequest from '../../../domain/entities/WasteBagTreatmentRequest';
import WasteBagTreatmentRequestRepository from '../../../domain/repositories/WasteBagTreatmentRequestRepository';

export default class GetWasteBagTreatmentRequestUseCase {
    constructor(private readonly repository: WasteBagTreatmentRequestRepository) {}

    async execute(id: string): Promise<WasteBagTreatmentRequest | null> {
        try {
            const wasteSource = await this.repository.getWasteBagTreatmentRequestById(id);
            console.log('Fetched waste bag treatment request successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching waste bag treatment request:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
