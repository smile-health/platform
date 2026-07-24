import WasteTreatmentGroupRepository from '../../../domain/repositories/WasteBagTreatmentGroupRepository';
import WasteTreatmentGroup from '../../../domain/entities/WasteBagTreatmentGroup';

export default class GetWasteTreatmentGroupUseCase {
    constructor(private readonly wasteSourceRepository: WasteTreatmentGroupRepository) {}

    async execute(
        token: string,
        id?: number,
        qrCodeId?: string,
    ): Promise<WasteTreatmentGroup | null> {
        try {
            const wasteSource =
                await this.wasteSourceRepository.getWasteBagTreatmentGroupByIdWithWasteBags(
                    token,
                    id,
                    qrCodeId,
                );
            console.log('Fetched waste source successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
