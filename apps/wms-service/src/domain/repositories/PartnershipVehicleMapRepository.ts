import PartnershipVehicleMap from '../entities/PartnershipVehicleMap';

export default interface PartnershipVehicleMapRepository {
    createPartnershipVehicleMap(partnershipVehicleMap: PartnershipVehicleMap): Promise<void>;
    updatePartnershipVehicleMap(partnershipVehicleMap: PartnershipVehicleMap): Promise<void | null>;
    deletePartnershipVehicleMap(partnershipId: number, vehicleId: number, deletedBy?: number): Promise<boolean | null>;
    getAllPartnershipVehicleMaps(
        limit: number,
        page: number,
        search?: string,
    ): Promise<{
        data: PartnershipVehicleMap[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
