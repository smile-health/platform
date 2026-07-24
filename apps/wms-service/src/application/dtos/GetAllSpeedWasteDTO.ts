export interface GetAllSpeedWasteDTO {
    limit?: number;
    page?: number;
    id?: number;
    entityId?: number;
    nib?: string;
    transporterId?: number;
    thirdPartyId?: number;
    wasteClassificationId?: number[];
    ownedBy?: string;
    wasteStatus?: string;
    wasteBagCode?: string;
    wasteTypeId?: number[];
    wasteGroupId?: number[];
    wasteCharacteristicsId?: number[];
}
