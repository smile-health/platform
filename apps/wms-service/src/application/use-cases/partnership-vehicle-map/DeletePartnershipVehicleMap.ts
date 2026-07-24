import PartnershipVehicleMapRepository from '../../../domain/repositories/PartnershipVehicleMapRepository';

export default class DeletePartnershipVehicleMapUseCase {
    constructor(private readonly repo: PartnershipVehicleMapRepository) {}

    async execute(partnershipId: number, vehicleId: number, deletedBy?: number): Promise<boolean | null> {
        try {
            if (!partnershipId || !vehicleId) {
                throw new Error('partnershipId and vehicleId is required to delete a waste source');
            }

            return await this.repo.deletePartnershipVehicleMap(partnershipId, vehicleId, deletedBy);
        } catch (error) {
            console.error('Error deleting partnership vehicle map:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
