import WasteTransportationRequest from '../../../domain/entities/WasteTransportationRequest';
import WasteTransportationRequestRepository from '../../../domain/repositories/WasteTransportationRequestRepository';
import UpdateWasteTransportationRequestDTO from '../../dtos/UpdateWasteTransportationRequestDTO';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';

export default class UpdateWasteTransportationRequestUseCase {
    constructor(
        private readonly repo: WasteTransportationRequestRepository,
        private readonly wasteTransportationGroup: WasteTransportationGroupRepository,
    ) {}

    async execute(
        data: UpdateWasteTransportationRequestDTO,
    ): Promise<WasteTransportationRequest | null | string> {
        try {
            const {
                id,
                updatedBy,
                requestStatus,
                transportationGroupId,
                requestCreatorId,
                requestApproverId,
            } = data;
            const existingData = await this.repo.getWasteTransportationRequestById(id.toString());

            if (!existingData) {
                return null;
            }

            const wasteSource: WasteTransportationRequest = new WasteTransportationRequest({
                ...existingData,
                updatedBy: updatedBy,
                updatedAt: new Date(),
                requestStatus: requestStatus ?? existingData.requestStatus,
                transportationGroupId: transportationGroupId ?? existingData.transportationGroupId,
                requestCreatorId: requestCreatorId ?? existingData.requestCreatorId,
                requestApproverId: requestApproverId ?? existingData.requestApproverId,
            });

            const existingDataRelation =
                await this.wasteTransportationGroup.getWasteTransportationGroupById(
                    transportationGroupId.toString(),
                );

            if (!existingDataRelation) {
                return `Waste transportation group with ID ${transportationGroupId} not found`;
            }

            await this.repo.updateWasteTransportationRequest(wasteSource);
            console.log('Waste source updated successfully(execute):', wasteSource);
            const updatedData = await this.repo.getWasteTransportationRequestById(id.toString());

            return updatedData;
        } catch (error) {
            console.error('Error updating Waste Transportation Request:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
