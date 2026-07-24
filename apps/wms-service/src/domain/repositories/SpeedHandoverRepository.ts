import SpeedTransportGroup from '../entities/SpeedTransportGroup';
import SpeedOperator from '../entities/SpeedOperator';
import SpeedTreatmentProvider from '../entities/SpeedTreatmentProvider';

export interface SpeedTransportGroupListFilter {
    limit: number;
    page: number;
    entityId?: number;
    // Resolved to entityId internally (join on EntitiesModel.nib) — takes precedence over
    // entityId if both are sent, same rule as SpeedWasteRepository.
    nib?: string;
    wasteStatus?: string;
    startDate?: string;
    endDate?: string;
}

export interface SpeedOperatorFilter {
    entityId?: number;
    // Resolved to entityId internally — takes precedence over entityId if both are sent.
    nib?: string;
    role?: string;
}

export interface SpeedTreatmentProviderFilter {
    limit: number;
    page: number;
    keyword?: string;
    nib?: string;
}

export interface HandoverToTransporterInput {
    groupCodes: string[];
    entityId?: number;
    nib?: string;
    vehicleNumber: string;
    transporterOperatorId?: string;
    manifestDocNumber?: string;
    manifestFile?: { originalname: string; buffer: Buffer; mimetype: string };
    latitude?: number;
    longitude?: number;
    handoverTimestamp: Date;
    startTime: Date;
    isReadOnly?: boolean;
    transporterId: number;
    transporterUpdatedBy: string;
}

export interface HandoverToTreatmentInput {
    groupCodes: string[];
    thirdPartyId?: number;
    nib?: string;
    treatmentLocationId: number;
    transporterOperatorId?: string;
    startTime: Date;
    endTime: Date;
    updatedBy: string;
}

export default interface SpeedHandoverRepository {
    getAllTransportGroups(filter: SpeedTransportGroupListFilter): Promise<{
        data: SpeedTransportGroup[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    getTransportGroupByCode(groupCode: string): Promise<SpeedTransportGroup | null>;
    getAllOperators(filter: SpeedOperatorFilter): Promise<SpeedOperator[]>;
    getAllTreatmentProviders(filter: SpeedTreatmentProviderFilter): Promise<{
        data: SpeedTreatmentProvider[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    handoverToTransporter(input: HandoverToTransporterInput): Promise<string[] | string>;
    handoverToTreatment(input: HandoverToTreatmentInput): Promise<string[] | string>;
}
