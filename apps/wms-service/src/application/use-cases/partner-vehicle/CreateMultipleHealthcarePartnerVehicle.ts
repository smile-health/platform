import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';
import CreatePartnerVehicletDTO, { CreateMultipleHealthcarePartnerVehicleDTO } from '../../dtos/CreatePartnerVehicleDTO';

export default class CreateMultipleHealthcarePartnerVehicleUseCase {
    constructor(private readonly assetModelRepository: PartnerVehicleRepository) {}

    async execute(data: CreateMultipleHealthcarePartnerVehicleDTO): Promise<PartnerVehicle> {
        try {
            const {
                createdBy,
                vehicleType,
                vehicleNumber,
                capacityInKgs,
                entityId,
                entityIds,
                transporterId,
            } = data;

            const assetModel: PartnerVehicle = new PartnerVehicle({
                vehicleType,
                vehicleNumber,
                capacityInKgs,
                entityIds,
                entityId,
                createdBy,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
                transporterId,
            });

            await this.assetModelRepository.createMultipleHealthcarePartnerVehicle(assetModel);
            console.log('Asset model created successfully:', assetModel);
            delete (assetModel as any).entityId;
            return assetModel;
        } catch (error) {
            console.error('Error creating Partner Vehicle:', error);

            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
