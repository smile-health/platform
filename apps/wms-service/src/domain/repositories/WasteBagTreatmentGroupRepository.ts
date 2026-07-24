import { WasteBagTreatmentGroupModel } from '../../infrastructure/database/models/WasteBagTreatmentGroupModel';
import WasteBagModel from '../../infrastructure/database/models/WasteBagModel';
import WasteTreatmentGroup, {
    WasteTreatmentGroupSelectDto,
} from '../../domain/entities/WasteBagTreatmentGroup';
export default interface WasteBagTreatmentGroupRepository {
    createWasteBagTreatmentGroup(
        wasteBagIds: string[],
        createdBy: string,
        status:
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED',
    ): Promise<number>;
    getWasteBagTreatmentGroupByIdWithWasteBags(
        token: string,
        id?: number,
        qrCodeId?: string,
    ): Promise<WasteTreatmentGroup | null>;
    getAllWasteTreatMentGroup(
        limit: number,
        page: number,
        entityId?: number,
        startDate?: Date,
        endDate?: Date,
        status?:
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT'
            | 'READY_FOR_TREATMENT'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED',
    ): Promise<{
        data: WasteTreatmentGroup[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    getPendingWasteTreatmentGroups(
        limit: number,
        page: number,
        healthcareFacilityId: number,
    ): Promise<{
        data: WasteTreatmentGroupSelectDto[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
