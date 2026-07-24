import { UserInfo } from '../../shared/types/userInfo';
import WasteBagRecord from '../entities/WasteBagRecord';

export default interface WasteBagRecordRepository {
    createWasteBagRecord(wasteBag: WasteBagRecord, token: string): Promise<WasteBagRecord | string>;
    getAllWasteBagRecord(
        limit: number,
        page: number,
        search?: string,
        healthcareId?: number,
        transporterId?: number,
        thirdPartyId?: number,
        wasteUpdateStart?: string,
        wasteUpdateEnd?: string,
        wasteClassificationId?: number[],
        transportationGroupId?: number,
        transportationExternalGroupId?: number,
        treatmentGroupId?: number,
        treatmentExternalGroupId?: number,
        sourceType?: string,
        ownedBy?: string,
        wasteStatus?: string,
        binNumber?: string,
        wasteBagQrCodeId?: string,
        id?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isTreated?: boolean,
        isDisposed?: boolean,
        entityTag?: string,
        entityId?: number,
    ): Promise<{
        date: any;
        totalWeight: any;
        wasteCharacteristics: {
            name: string;
            totalWeight: unknown;
        }[];
    }[]>;
}
