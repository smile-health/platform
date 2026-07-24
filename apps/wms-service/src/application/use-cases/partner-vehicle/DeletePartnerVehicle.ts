import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';
import DeletePartnerVehicleDTO from '../../dtos/DeletePartnerVehicleDTO';

export default class DeletePartnerVehicleUseCase {
    constructor(private readonly assetModelRepository: PartnerVehicleRepository) {}

    async execute(data: DeletePartnerVehicleDTO): Promise<boolean | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete an partner vehicle');
            }

            const idString = id.toString();

            return await this.assetModelRepository.deletePartnerVehicle(idString, data.deletedBy);
        } catch (error) {
            console.error('Error deleting partner vehicle:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
