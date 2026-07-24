import WasteTransportationGroup from '../../../domain/entities/WasteTransportationGroup';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';
import CreateWasteTransportationGroupDTO from '../../dtos/CreateWasteTransportationGroupDTO';

export default class CreateWasteTransportationGroupUseCase {
    constructor(private readonly wasteSourceRepository: WasteTransportationGroupRepository) {}

    async execute(
        wasteBagIds: string[],
        data: CreateWasteTransportationGroupDTO,
        entityId: number,
    ): Promise<WasteTransportationGroup> {
        try {
            const {
                createdBy,
                totalBagsCount,
                totalWeightInKgs,
                transporterVehicleId,
                transporterOperatorId,
                handoverLattitude,
                handoverLongitude,
                transportationStatus,
                handoverTimestamp,
            } = data;

            const wasteSource: WasteTransportationGroup = new WasteTransportationGroup({
                createdAt: new Date(),
                createdBy,
                totalBagsCount,
                totalWeightInKgs,
                transporterVehicleId,
                transporterOperatorId,
                handoverLattitude,
                handoverLongitude,
                transportationStatus,
                handoverTimestamp,
            });

            await this.wasteSourceRepository.createWasteTransportationGroup(
                wasteBagIds,
                wasteSource,
                entityId,
                '',
            );
            console.log('Waste source created successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error creating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
