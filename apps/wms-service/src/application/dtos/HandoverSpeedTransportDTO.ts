export interface HandoverSpeedTransportDTO {
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
