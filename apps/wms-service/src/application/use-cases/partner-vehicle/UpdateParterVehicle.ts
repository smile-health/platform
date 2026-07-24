import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';
import UpdatePartnerVehicleDTO from '../../dtos/UpdatePartnerVehicleDTO';

export default class UpdatePartnerVehicleUseCase {
    constructor(private readonly assetModelRepository: PartnerVehicleRepository) {}

    async execute(data: UpdatePartnerVehicleDTO): Promise<PartnerVehicle | null> {
        try {
            const { id, updatedBy, vehicleType, vehicleNumber, capacityInKgs, entityId } = data;

            if (!id) {
                throw new Error('ID is required to update an Partner Vehicle');
            }

            const existingPartnerVehicle = await this.assetModelRepository.getPartnerVehicleById(
                id.toString(),
            );
            if (!existingPartnerVehicle) {
                return null;
            }

            const updatedPartnerVehicle: PartnerVehicle = new PartnerVehicle({
                ...existingPartnerVehicle,
                updatedBy: updatedBy,
                updatedAt: new Date(),
                vehicleType: vehicleType ?? existingPartnerVehicle.vehicleType,
                vehicleNumber: vehicleNumber ?? existingPartnerVehicle.vehicleNumber,
                capacityInKgs: capacityInKgs ?? existingPartnerVehicle.capacityInKgs,
                entityId: entityId ?? existingPartnerVehicle.entityId,
            });

            return await this.assetModelRepository.updatePartnerVehicle(updatedPartnerVehicle);
        } catch (error) {
            console.error('Error updating Partner Vehicle:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
