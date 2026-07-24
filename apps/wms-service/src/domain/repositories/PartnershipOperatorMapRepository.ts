import { WhereOptions } from 'sequelize';
import PartnershipOperatorMap, { OperatorsSelectDTO } from '../entities/PartnershipOperatorMap';

export default interface PartnershipOperatorMapRepository {
    createPartnershipOperatorMap(partnershipOperatorMap: PartnershipOperatorMap): Promise<void>;
    updatePartnershipOperatorMap(
        partnershipOperatorMap: PartnershipOperatorMap,
        partnership_id: number,
        operator_id: string,
    ): Promise<void | null>;
    deletePartnershipOperatorMap(
        partnershipId: number,
        operatorId: string,
        deletedBy?: number,
    ): Promise<boolean | null>;
    getAllPartnershipOperatorMaps(
        limit: number,
        page: number,
        token: string,
        providerId: number,
        search?: string,
        partnershipId?: number,
    ): Promise<{
        data: PartnershipOperatorMap[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getAllPartnershipOperatorMapsByThirdpartyAdmin(
        limit: number,
        page: number,
        token: string,
        search?: string,
        operatorId?: string,
    ): Promise<{
        data: PartnershipOperatorMap[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getOperatorsFromOperatorMap(token: string, entityId?: number): Promise<OperatorsSelectDTO[]>;
    findPartnershipOperatorMapByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<PartnershipOperatorMap | null>;
}
