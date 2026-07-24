export default interface CreateHealthcareFacilityAssetActivityDTO {
    createdBy: string;
    createdAt: Date;
    operatorId: string;
    hfAssetId: number;
    activityType: 'MAINTENANCE' | 'CALIBRATION';
    startDate: Date;
    endDate?: Date;
}
