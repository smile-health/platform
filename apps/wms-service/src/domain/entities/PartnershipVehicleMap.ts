import { PartnershipAttributes } from '../../infrastructure/database/models/PartnershipModel';
import { PartnerVehicleAttributes } from '../../infrastructure/database/models/PartnerVehicleModel';

export default class PartnershipVehicleMap {
    public partnershipId: number;
    public vehicleId: number;
    public partnership: PartnershipAttributes | undefined;
    public partnerVehicle: PartnerVehicleAttributes | undefined;

    constructor(model: {
        partnershipId: number;
        vehicleId: number;
        partnership?: PartnershipAttributes;
        partnerVehicle?: PartnerVehicleAttributes;
    }) {
        this.partnershipId = model.partnershipId;
        this.vehicleId = model.vehicleId;
        this.partnership = model.partnership;
        this.partnerVehicle = model.partnerVehicle;
    }
}
