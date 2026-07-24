import PartnerVehicle from '../../../domain/entities/PartnerVehicle';
import PartnerVehicleRepository from '../../../domain/repositories/PartnerVehicleRepository';

export default class GetAllPartnerVehicleByIdUseCase {
  constructor(private readonly partnerVehicleRepository: PartnerVehicleRepository) {}

  async execute(
    limit: number,
    page: number,
    token: string,
    transporterId: number,
    search?: string,
    entityTag?: string,
    healthcareFacilityId?: number,
    providerId?: number,
  ): Promise<{
    data: PartnerVehicle[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const partnerVehicles = await this.partnerVehicleRepository.getAllPartnerVehicles(
        limit,
        page,
        token,
        transporterId,
        search,
        entityTag,
        healthcareFacilityId,
        providerId,
      );
      console.log(`Asset models retrieved successfully:`, partnerVehicles);
      return partnerVehicles;
    } catch (error) {
      console.error('Error retrieving Partner Vehicles:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
