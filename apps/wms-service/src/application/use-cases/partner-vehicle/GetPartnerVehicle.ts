import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';

export default class GetPartnerVehicleByIdUseCase {
    constructor(private readonly partnerVehicleRepository: PartnerVehicleRepository) {}

    async execute(id: string, token: string): Promise<PartnerVehicle | null> {
        try {
            const partnerVehicle = await this.partnerVehicleRepository.getPartnerVehicleById(
                id,
                token,
            );

            return partnerVehicle;
        } catch (error) {
            console.error('Error retrieving Partner Vehicle:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
