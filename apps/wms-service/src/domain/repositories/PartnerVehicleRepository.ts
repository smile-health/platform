import PartnerVehicle from '../entities/PartnerVehicle';

export default interface PartnerVehicleRepository {
  createPartnerVehicle(wasteSource: PartnerVehicle): Promise<void>;
  createMultipleHealthcarePartnerVehicle(wasteSource: PartnerVehicle): Promise<void>;
  updatePartnerVehicle(wasteSource: PartnerVehicle): Promise<PartnerVehicle | null>;
  deletePartnerVehicle(id: string, deletedBy?: number): Promise<boolean | null>;
  getPartnerVehicleById(id: string, token?: string): Promise<PartnerVehicle | null>;
  getPartnerVehicleByVehicleNumber(id: string, entityId: number): Promise<PartnerVehicle | null>;
  getAllPartnerVehicles(
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
  }>;

  exportPartnerVehiclesToExcel(
    token: string,
    transporterId: number,
    lang: string,
    search?: string,
    entityTag?: string,
    healthcareFacilityId?: number,
  ): Promise<Buffer>;
}
