import DisposalModel from '../../infrastructure/database/models/DisposalModel';
import { BastBody } from '../../shared/types/bastType';
import Disposal from '../entities/Disposal';

export default interface DisposalRepository {
    createDisposal(model: BastBody): Promise<{ bast_no: string } | null | string>;
    approvalDisposal(
        bastNo: string,
        status: 'APPROVED' | 'REJECTED',
        userUuid: string,
        token: string,
        reason?: string,
    ): Promise<boolean>;
    getAlldisposalByEntityId(
        limit: number,
        page: number,
        entityId: number | undefined,
        search?: string,
        status?: string,
        isRead?: boolean,
    ): Promise<{
        data: any[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getDisposal(
        bastNo: string,
        token: string,
    ): Promise<any>;
}
