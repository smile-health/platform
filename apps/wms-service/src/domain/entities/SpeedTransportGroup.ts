import { SpeedWasteClassification, SpeedWasteLogHistoryEntry } from './SpeedWaste';
import SpeedOperator from './SpeedOperator';

export interface SpeedTransportGroupBag {
    id: number;
    wasteBagCode: string;
    wasteStatus: string;
    weightInKgs: number | null;
    createdAt: Date;
    entityId: number;
    entityName: string | null;
    wasteStatusUpdatedAt: Date | null;
    // Only resolved for the by-code detail lookup, not the list — same "detail-only" pattern as
    // SpeedWaste.logHistory. `undefined` means "not fetched for this call".
    logHistory?: SpeedWasteLogHistoryEntry[];
}

export interface SpeedTransportGroupPartnershipSide {
    providerId: number | null;
    providerName: string | null;
    operators: SpeedOperator[];
}

export interface SpeedTransportGroupPartnership {
    transport: SpeedTransportGroupPartnershipSide;
    treatment: SpeedTransportGroupPartnershipSide;
}

export interface SpeedTransportGroupData {
    id: number;
    groupCode: string;
    entityId: number;
    entityName: string | null;
    entityNib: string | null;
    totalBags: number;
    totalWeightInKgs: number;
    totalWeightInTons: number;
    wasteStatus: string;
    transporterId: number | null;
    transporterName: string | null;
    createdAt: Date;
    bags: SpeedTransportGroupBag[];
    wasteClassification: SpeedWasteClassification | null;
    partnership: SpeedTransportGroupPartnership;
}

export default class SpeedTransportGroup implements SpeedTransportGroupData {
    public id: number;
    public groupCode: string;
    public entityId: number;
    public entityName: string | null;
    public entityNib: string | null;
    public totalBags: number;
    public totalWeightInKgs: number;
    public totalWeightInTons: number;
    public wasteStatus: string;
    public transporterId: number | null;
    public transporterName: string | null;
    public createdAt: Date;
    public bags: SpeedTransportGroupBag[];
    public wasteClassification: SpeedWasteClassification | null;
    public partnership: SpeedTransportGroupPartnership;

    constructor(data: SpeedTransportGroupData) {
        this.id = data.id;
        this.groupCode = data.groupCode;
        this.entityId = data.entityId;
        this.entityName = data.entityName;
        this.entityNib = data.entityNib;
        this.totalBags = data.totalBags;
        this.totalWeightInKgs = data.totalWeightInKgs;
        this.totalWeightInTons = data.totalWeightInTons;
        this.wasteStatus = data.wasteStatus;
        this.transporterId = data.transporterId;
        this.transporterName = data.transporterName;
        this.createdAt = data.createdAt;
        this.bags = data.bags;
        this.wasteClassification = data.wasteClassification;
        this.partnership = data.partnership;
    }
}
