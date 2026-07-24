import WasteBagRecord from '../../../domain/entities/WasteBagRecord';
import WasteBagRecordRepository from '../../../domain/repositories/WasteBagRecordRepository';

export default class GetAllWasteBagRecordUseCase {
    constructor(private readonly repo: WasteBagRecordRepository) {}

    async execute(
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
    }[]> {
        try {
            const wasteSources = await this.repo.getAllWasteBagRecord(
                limit,
                page,
                search,
                healthcareId,
                transporterId,
                thirdPartyId,
                wasteUpdateStart,
                wasteUpdateEnd,
                wasteClassificationId,
                transportationGroupId,
                transportationExternalGroupId,
                treatmentGroupId,
                treatmentExternalGroupId,
                sourceType,
                ownedBy,
                wasteStatus,
                binNumber,
                wasteBagQrCodeId,
                id,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
                isTreated,
                isDisposed,
                entityTag,
                entityId,
            );
            console.log('Fetched all waste bag successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
