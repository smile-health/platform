import PartnershipVehicleMap from '../../../domain/entities/PartnershipVehicleMap';
import PartnershipVehicleMapRepository from '../../../domain/repositories/PartnershipVehicleMapRepository';
import UpdatePartnershipVehicleMapDTO from '../../dtos/UpdatePartnershipVehicleMapDTO';

export default class UpdatePartnershipVehicleMapUseCase {
    constructor(private readonly repo: PartnershipVehicleMapRepository) {}

    async execute(data: UpdatePartnershipVehicleMapDTO): Promise<PartnershipVehicleMap | null> {
        try {
            const { partnershipId, vehicleId } = data;

            const wasteSource: PartnershipVehicleMap = new PartnershipVehicleMap({
                partnershipId,
                vehicleId,
            });

            await this.repo.updatePartnershipVehicleMap(wasteSource);
            console.log('Partnership vehicle map updated successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error creating Partnership vehicle map:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
