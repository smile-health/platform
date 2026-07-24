import PartnershipVehicleMap from '../../../domain/entities/PartnershipVehicleMap';
import PartnershipVehicleMapRepository from '../../../domain/repositories/PartnershipVehicleMapRepository';
import CreatePartnershipVehicleMapDTO from '../../dtos/CreatePartnershipVehicleMapDTO';
import PartnershipRepository from '../../../domain/repositories/PartnershipRepository';

export default class CreatePartnershipVehicleMapUseCase {
    constructor(
        private readonly wasteSourceRepository: PartnershipVehicleMapRepository,
        private readonly partnership: PartnershipRepository,
    ) {}

    async execute(data: CreatePartnershipVehicleMapDTO): Promise<PartnershipVehicleMap | string> {
        try {
            const { partnershipId, vehicleId } = data;

            const wasteSource: PartnershipVehicleMap = new PartnershipVehicleMap({
                partnershipId,
                vehicleId,
            });

            const validationPartnership = await this.partnership.getPartnershipById(
                partnershipId.toString(),
                '',
            );

            if (!validationPartnership) {
                return `No asset partnership for ID ${partnershipId}`;
            }

            await this.wasteSourceRepository.createPartnershipVehicleMap(wasteSource);
            console.log('Partnership VehicleMap created successfully(execute):', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error creating Partnership VehicleMap :', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
