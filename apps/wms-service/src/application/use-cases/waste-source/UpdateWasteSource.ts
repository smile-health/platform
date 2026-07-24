import WasteSource from '../../../domain/entities/WasteSource';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';
import UpdateWasteSourceDTO from '../../dtos/UpdateWasteSourceDTO';

export default class UpdateWasteSourceUseCase {
    constructor(private readonly wasteSourceRepository: WasteSourceRepository) {}

    async execute(data: UpdateWasteSourceDTO): Promise<WasteSource | null | undefined> {
        try {
            const {
                id,
                healthcareFacilityId,
                sourceType,
                internalSourceName,
                internalTreatmentName,
                externalHealthcareFacilityId,
                externalHealthcareFacilityName,
                isActive,
                updatedBy,
            } = data;

            const existingData = await this.wasteSourceRepository.getWasteSourceById(id.toString());

            if (!existingData) {
                return null;
            }

            const wasteSource: WasteSource = new WasteSource({
                ...existingData,
                healthcareFacilityId: healthcareFacilityId ?? existingData.healthcareFacilityId,
                sourceType:
                    existingData.sourceType === 'EXTERNAL' || existingData.sourceType === 'INTERNAL'
                        ? sourceType
                        : existingData.sourceType,
                internalSourceName: internalSourceName ?? existingData.internalSourceName,
                internalTreatmentName: internalTreatmentName ?? existingData.internalTreatmentName,
                externalHealthcareFacilityId:
                    externalHealthcareFacilityId ?? existingData.externalHealthcareFacilityId,
                externalHealthcareFacilityName:
                    externalHealthcareFacilityName ?? existingData.externalHealthcareFacilityName,
                isActive: isActive ?? existingData.isActive,
                updatedBy: updatedBy,
                updatedAt: new Date(),
            });

            const result = await this.wasteSourceRepository.updateWasteSource(wasteSource);

            if (result === null) {
                return null;
            }

            return wasteSource;
        } catch (error) {
            console.error('Error updating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
