import WasteTransportationGroup from '../../../domain/entities/WasteTransportationGroup';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';
import UpdateWasteTransportationGroupDTO from '../../dtos/UpdateWasteTransportationGroupDTO';

export default class UpdateWasteTransportationGroupUseCase {
    constructor(private readonly wasteSourceRepository: WasteTransportationGroupRepository) {}

    async execute(
        data: UpdateWasteTransportationGroupDTO,
    ): Promise<WasteTransportationGroup | null> {
        try {
            const {
                id,
                totalBagsCount,
                totalWeightInKgs,
                transporterVehicleId,
                transporterOperatorId,
                handoverLattitude,
                handoverLongitude,
                transportationStatus,
                updatedBy,
            } = data;

            const existingData = await this.wasteSourceRepository.getWasteTransportationGroupById(
                id.toString(),
            );

            if (!existingData) {
                return null;
            }

            const wasteSource: WasteTransportationGroup = new WasteTransportationGroup({
                ...existingData,
                updatedBy: updatedBy,
                updatedAt: new Date(),
                totalBagsCount: totalBagsCount ?? existingData.totalBagsCount,
                totalWeightInKgs: totalWeightInKgs ?? existingData.totalWeightInKgs,
                transporterVehicleId: transporterVehicleId ?? existingData.transporterVehicleId,
                transporterOperatorId: transporterOperatorId ?? existingData.transporterOperatorId,
                handoverLattitude: handoverLattitude ?? existingData.handoverLattitude,
                handoverLongitude: handoverLongitude ?? existingData.handoverLongitude,
                transportationStatus: transportationStatus ?? existingData.transportationStatus,
            });

            await this.wasteSourceRepository.updateWasteTransportationGroup(wasteSource);
            console.log('Waste source updated successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error updating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
