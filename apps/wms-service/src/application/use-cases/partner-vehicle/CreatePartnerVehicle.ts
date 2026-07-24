import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';
import CreatePartnerVehicletDTO from '../../dtos/CreatePartnerVehicleDTO';

export default class CreatePartnerVehicleUseCase {
    constructor(private readonly assetModelRepository: PartnerVehicleRepository) {}

    async execute(data: CreatePartnerVehicletDTO): Promise<PartnerVehicle> {
        try {
            const {
                createdBy,
                vehicleType,
                vehicleNumber,
                capacityInKgs,
                entityId,
                transporterId,
            } = data;

            const assetModel: PartnerVehicle = new PartnerVehicle({
                vehicleType,
                vehicleNumber,
                capacityInKgs,
                entityId,
                createdBy,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
                transporterId,
            });

            await this.assetModelRepository.createPartnerVehicle(assetModel);
            console.log('Asset model created successfully:', assetModel);
            return assetModel;
        } catch (error) {
            console.error('Error creating Partner Vehicle:', error);

            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
