import WasteTransportationRequest from '../../../domain/entities/WasteTransportationRequest';
import WasteTransportationRequestRepository from '../../../domain/repositories/WasteTransportationRequestRepository';

export default class GetWasteTransportationRequestUseCase {
    constructor(private readonly wasteSourceRepository: WasteTransportationRequestRepository) {}

    async execute(id: string): Promise<WasteTransportationRequest | null> {
        try {
            const wasteSource =
                await this.wasteSourceRepository.getWasteTransportationRequestById(id);
            console.log('Fetched Waste Transportation Request successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching Waste Transportation Request:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
