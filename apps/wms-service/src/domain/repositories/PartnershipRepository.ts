import { WhereOptions } from 'sequelize';
import Partnership, {
    HealthcareSelectDTO,
    PartnershipSelectDTO,
    PartnershipWasteClassification,
    WasteClassificationSelectDTO,
} from '../entities/Partnership';
import { logMessage } from '../../shared/types/rabbitmq';

export default interface PartnershipRepository {
    createPartnership(data: Partnership): Promise<Partnership>;
    getPartnershipById(id: string, token: string): Promise<Partnership | null>;
    updateStatusPartnreship(
        id: number,
        status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED',
    ): Promise<Partnership | null>;
    getPartnershipByIdScheduler(id: number): Promise<Partnership | null>;
    getAllPartnershipByUserId(
        limit: number,
        page: number,
        entityId: number | undefined,
        entityTag: string | undefined,
        token: string,
        search?: string,
        providerId?: number,
        consumerId?: number,
        wasteClassificationId?: number,
        partnershipStatus?: string,
    ): Promise<{
        data: Partnership[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    deletePartnership(id: string, deletedBy?: number): Promise<boolean>;
    updatePartnership(data: Partnership): Promise<void | null>;
    getHealthcareByThirdPartyAdmin(
        token: string,
        entityId?: number,
    ): Promise<HealthcareSelectDTO[]>;
    getPartnershipByThirdPartyAdmin(
        token: string,
        entityId?: number,
        entityTag?: string,
    ): Promise<PartnershipSelectDTO[]>;
    getWasteClassificationByHealthcare(
        consumerId: number,
        providerId: number,
        isSameCompany?: number,
    ): Promise<WasteClassificationSelectDTO[]>;
    findPartnershipByCondition(whereClause: WhereOptions<any>): Promise<Partnership | null>;
    getWasteClassificationByConsumerIdAndProviderId(
        limit: number,
        page: number,
        providerId: number,
        consumerId: number,
    ): Promise<{
        data: PartnershipWasteClassification[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getHasMultiplePartnership(
        healthcareFacilityId: number,
        wasteClassificationId: number[],
    ): Promise<any>;

    findOneThirdParty(
        healthcareFacilityId: number,
        transporterId: number,
        wasteClassificationId: number[],
    ): Promise<any>;
}
