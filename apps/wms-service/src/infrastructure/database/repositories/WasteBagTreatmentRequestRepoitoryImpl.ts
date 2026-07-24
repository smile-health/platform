import WasteBagTreatmentRequest from '../../../domain/entities/WasteBagTreatmentRequest';
import {
    WasteBagTreatmentRequestModel,
    WasteBagTreatmentRequestAttributes,
} from '../models/WasteBagTreatmentRequestModel';
import WasteBagTreatmentRequestRepository from '../../../domain/repositories/WasteBagTreatmentRequestRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op } from 'sequelize';

export default class WasteBagTreatmentRequestRepositoryImpl
    implements WasteBagTreatmentRequestRepository
{
    async createWasteBagTreatmentRequest(
        WasteBagTreatmentRequest: WasteBagTreatmentRequest,
    ): Promise<void> {
        try {
            if (!WasteBagTreatmentRequest.createdBy) {
                throw new Error('Missing required fields for WasteBagTreatmentRequest');
            }
            const createModelObj: WasteBagTreatmentRequestAttributes = {
                createdBy: WasteBagTreatmentRequest.createdBy,
                updatedBy: WasteBagTreatmentRequest.createdBy,
                requestStatus: WasteBagTreatmentRequest.requestStatus,
                treatmentGroupId: WasteBagTreatmentRequest.treatmentGroupId,
                requestApproverId: WasteBagTreatmentRequest.requestApproverId,
                requestCreatorId: WasteBagTreatmentRequest.requestCreatorId,
            };
            console.log('Waste bag treatment transporation:', createModelObj);
            await WasteBagTreatmentRequestModel.create(createModelObj);
            console.log('Waste bag treatment transporation created successfully');
        } catch (error) {
            console.error('Error creating Waste bag treatment transporation:', error);
            throw new Error('Error creating Waste bag treatment transporation');
        }
    }

    async getWasteBagTreatmentRequestById(id: string): Promise<WasteBagTreatmentRequest | null> {
        try {
            const existingData = (await checkExistingData(
                WasteBagTreatmentRequestModel,
                id,
            )) as any;

            if (!existingData) {
                console.error(`Waste bag treatment request with ID ${id} not found`);
                return null;
            }

            return new WasteBagTreatmentRequest({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.get('created_by'),
                createdAt: existingData.get('created_at'),
                requestStatus: existingData.get('request_status'),
                treatmentGroupId: existingData.get('treatment_group_id'),
                requestApproverId: existingData.get('request_creator_id'),
                requestCreatorId: existingData.get('request_approver_id'),
            });
        } catch (error) {
            console.error('Error retrieving Waste bag treatment transporation:', error);
            throw new Error('Error retrieving Waste bag treatment transporation');
        }
    }

    async getAllWasteBagTreatmentRequests(
        limit: number,
        page: number,
        entity_id: string | number | undefined,
        search: string | undefined = undefined,
    ): Promise<{
        data: WasteBagTreatmentRequest[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
            });

            const { count, rows } = await WasteBagTreatmentRequestModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(search && {
                        name: { [Op.like]: `%${search}%` },
                    }),
                },
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    return new WasteBagTreatmentRequest({
                        id: m.get('id') as number | undefined,
                        createdBy: m.get('created_by'),
                        createdAt: m.get('created_at'),
                        updatedBy: m.get('updated_by'),
                        updatedAt: m.get('updated_at'),
                        requestStatus: m.get('request_status'),
                        treatmentGroupId: m.get('treatment_group_id'),
                        requestApproverId: m.get('request_creator_id'),
                        requestCreatorId: m.get('request_approver_id'),
                    });
                }),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving Waste bag treatment transporation:', error);
            throw new Error('Error retrieving Waste bag treatment transporation');
        }
    }

    async updateWasteBagTreatmentRequest(
        wasteBagTreatmentRequest: WasteBagTreatmentRequest,
    ): Promise<void | null> {
        try {
            if (!wasteBagTreatmentRequest.id) {
                throw new Error('Missing required fields for WasteBagTreatmentRequest update');
            }

            const existingData = (await checkExistingData(
                WasteBagTreatmentRequestModel,
                wasteBagTreatmentRequest.id,
            )) as any;

            if (!existingData) {
                console.error(
                    `Waste bag treatment transporation with ID ${wasteBagTreatmentRequest.id} not found`,
                );
                return null;
            }

            const updateModelObj = {
                updated_by: wasteBagTreatmentRequest.updatedBy,
                requestStatus: wasteBagTreatmentRequest.requestStatus,
                treatmentGroupId: wasteBagTreatmentRequest.treatmentGroupId,
                requestApproverId: wasteBagTreatmentRequest.requestApproverId,
                requestCreatorId: wasteBagTreatmentRequest.requestCreatorId,
                updatedAt: new Date(),
            };

            await WasteBagTreatmentRequestModel.update(updateModelObj, {
                where: { id: wasteBagTreatmentRequest.id },
            });
            console.log('Waste bag treatment transporation updated successfully');
        } catch (error) {
            console.error('Error updating Waste bag treatment transporation:', error);
            throw new Error('Error updating Waste bag treatment transporation');
        }
    }

    async deleteWasteBagTreatmentRequest(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(
                WasteBagTreatmentRequestModel,
                id,
            )) as any;

            if (!existingData) {
                console.error(`Waste bag treatment transporation with ID ${id} not found`);
                return false;
            }

            if (deletedBy) await existingData.update({ deletedBy });
            await existingData.destroy();
            return true;
        } catch (error) {
            console.error('Error deleting Waste bag treatment transporation:', error);
            throw new Error('Error deleting Waste bag treatment transporation');
        }
    }
}
