import WasteTransportationRequest from '../../../domain/entities/WasteTransportationRequest';
import WasteTransportationRequestRepository from '../../../domain/repositories/WasteTransportationRequestRepository';
import CreateWasteTransportationRequestDTO from '../../dtos/CreateWasteTransportationRequestDTO';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';
export default class CreateWasteTransportationRequestUseCase {
    constructor(
        private readonly repo: WasteTransportationRequestRepository,
        private readonly wasteTransportationGroup: WasteTransportationGroupRepository,
    ) {}

    async execute(
        data: CreateWasteTransportationRequestDTO,
    ): Promise<WasteTransportationRequest | string> {
        try {
            const {
                createdBy,
                requestStatus,
                transportationGroupId,
                requestCreatorId,
                requestApproverId,
            } = data;

            const wasteSource: WasteTransportationRequest = new WasteTransportationRequest({
                createdAt: new Date(),
                createdBy,
                requestStatus,
                transportationGroupId,
                requestCreatorId,
                requestApproverId,
            });

            const existingDataRelation =
                await this.wasteTransportationGroup.getWasteTransportationGroupById(
                    transportationGroupId.toString(),
                );

            if (!existingDataRelation) {
                return `Waste transportation group with ID ${transportationGroupId} not found`;
            }

            await this.repo.createWasteTransportationRequest(wasteSource);
            console.log('Waste source created successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error creating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
