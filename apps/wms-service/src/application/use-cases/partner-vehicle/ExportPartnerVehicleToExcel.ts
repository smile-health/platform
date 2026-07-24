import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';

export default class ExportPartnerVehicleToExcelUseCase {
    constructor(private readonly partnerVehicleRepository: PartnerVehicleRepository) {}

    async execute(
        token: string,
        transporterId: number,
        lang: string,
        search?: string,
        entityTag?: string,
        healthcareFacilityId?: number,
    ): Promise<Buffer>{
        try {
            const partnerVehicles = await this.partnerVehicleRepository.exportPartnerVehiclesToExcel(
                token,
                transporterId,
                lang,
                search,
                entityTag,
                healthcareFacilityId
            );
            console.log(`export partner vehicle retrieved successfully:`, partnerVehicles);
            return partnerVehicles;
        } catch (error) {
            console.error('Error retrieving Partner Vehicles:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
