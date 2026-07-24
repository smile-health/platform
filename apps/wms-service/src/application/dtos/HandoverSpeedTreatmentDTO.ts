export interface HandoverSpeedTreatmentDTO {
    groupCodes: string[];
    thirdPartyId?: number;
    nib?: string;
    treatmentLocationId: number;
    transporterOperatorId?: string;
    startTime: Date;
    endTime: Date;
    updatedBy: string;
}
