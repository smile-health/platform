import WasteTransportationRequest from '../../../domain/entities/WasteTransportationRequest';
import {
    WasteTransportationRequestModel,
    WasteTransportationRequestAttributes,
} from '../models/WasteTransportationRequestModel';
import WasteTransportationRequestRepository from '../../../domain/repositories/WasteTransportationRequestRepository';
import {
    checkExistingData,
    checkExistingDataWithJoin,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteTransportationGroupModel from '../models/WasteTransportationGroupModel';
import { WasteTransportationGroupAttributes } from '../models/WasteTransportationGroupModel';

export default class WasteTransportationRequestRepositoryImpl
    implements WasteTransportationRequestRepository
{
    async createWasteTransportationRequest(
        wasteTransportationRequest: WasteTransportationRequest,
    ): Promise<void> {
        try {
            if (!wasteTransportationRequest.createdBy) {
                throw new Error('Missing required fields for WasteTransportationRequest');
            }
            const createModelObj: WasteTransportationRequestAttributes = {
                createdBy: wasteTransportationRequest.createdBy,
                updatedBy: wasteTransportationRequest.createdBy,
                requestStatus: wasteTransportationRequest.requestStatus,
                transportationGroupId: wasteTransportationRequest.transportationGroupId,
                requestCreatorId: wasteTransportationRequest.requestCreatorId,
                requestApproverId: wasteTransportationRequest.requestApproverId,
            };
            console.log('createModelObj:', createModelObj);
            await WasteTransportationRequestModel.create(createModelObj);
            console.log('Waste source created successfully');
        } catch (error) {
            console.error('Error creating Waste source:', error);
            throw new Error('Error creating Waste source');
        }
    }

    async getWasteTransportationRequestById(
        id: string,
    ): Promise<WasteTransportationRequest | null> {
        try {
            const existingData = (await checkExistingDataWithJoin(
                WasteTransportationRequestModel,
                WasteTransportationGroupModel,
                [
                    'id',
                    'createdBy',
                    'updatedBy',
                    'created_at',
                    'updated_at',
                    'totalBagsCount',
                    'totalWeightInKgs',
                    'transporterVehicleId',
                    'transporterOperatorId',
                    'handoverLattitude',
                    'handoverLongitude',
                    'transportationStatus',
                ],
                'transportationGroup',
                false,
                id,
            )) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            const externalData = existingData.get(
                'transportationGroup',
            ) as WasteTransportationGroupAttributes | null;

            return new WasteTransportationRequest({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.createdBy,
                updatedBy: existingData.updatedBy,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                requestStatus: existingData.requestStatus,
                transportationGroupId: existingData.transportationGroupId,
                requestCreatorId: existingData.requestCreatorId,
                requestApproverId: existingData.requestApproverId,
                transportationGroup: externalData
                    ? {
                          id: externalData.id,
                          totalBagsCount: externalData.totalBagsCount,
                          totalWeightInKgs: externalData.totalWeightInKgs,
                          transporterVehicleId: externalData.transporterVehicleId,
                          transporterOperatorId: externalData.transporterOperatorId,
                          handoverLattitude: externalData.handoverLattitude,
                          handoverLongitude: externalData.handoverLongitude,
                          transportationStatus: externalData.transportationStatus,
                      }
                    : undefined,
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getAllWasteTransportationRequests(
        limit: number,
        page: number,
        search: string | undefined = undefined,
    ): Promise<{
        data: WasteTransportationRequest[];
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

            const { count, rows } = await WasteTransportationRequestModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    // ...(search && {
                    //     name: { [Op.like]: `%${search}%` },
                    // }),
                },
                include: [
                    {
                        model: WasteTransportationGroupModel,
                        as: 'transportationGroup',
                        required: false,
                        attributes: [
                            'id',
                            'createdBy',
                            'updatedBy',
                            'created_at',
                            'updated_at',
                            'totalBagsCount',
                            'totalWeightInKgs',
                            'transporterVehicleId',
                            'transporterOperatorId',
                            'handoverLattitude',
                            'handoverLongitude',
                            'transportationStatus',
                        ],
                    },
                ],
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    const externalData = m.get(
                        'transportationGroup',
                    ) as WasteTransportationGroupAttributes | null;

                    return new WasteTransportationRequest({
                        id: m.get('id') as number | undefined,
                        createdBy: m.createdBy,
                        updatedBy: m.updatedBy,
                        createdAt: m.get('created_at'),
                        updatedAt: m.get('updated_at') as Date,
                        requestStatus: m.requestStatus,
                        transportationGroupId: m.transportationGroupId,
                        requestCreatorId: m.requestCreatorId,
                        requestApproverId: m.requestApproverId,
                        transportationGroup: externalData
                            ? {
                                  id: externalData.id,
                                  totalBagsCount: externalData.totalBagsCount,
                                  totalWeightInKgs: externalData.totalWeightInKgs,
                                  transporterVehicleId: externalData.transporterVehicleId,
                                  transporterOperatorId: externalData.transporterOperatorId,
                                  handoverLattitude: externalData.handoverLattitude,
                                  handoverLongitude: externalData.handoverLongitude,
                                  transportationStatus: externalData.transportationStatus,
                              }
                            : undefined,
                    });
                }),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving waste sources:', error);
            throw new Error('Error retrieving waste sources');
        }
    }

    async updateWasteTransportationRequest(
        wasteTransportationRequest: WasteTransportationRequest,
    ): Promise<void | null> {
        try {
            if (!wasteTransportationRequest.id || !wasteTransportationRequest.updatedBy) {
                throw new Error('Missing required fields for WasteTransportationRequest update');
            }

            const existingData = (await checkExistingData(
                WasteTransportationRequestModel,
                wasteTransportationRequest.id,
            )) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${wasteTransportationRequest.id} not found`);
                return null;
            }

            const updateModelObj = {
                updated_by: wasteTransportationRequest.updatedBy,
                updatedAt: new Date(),
                requestStatus: wasteTransportationRequest.requestStatus,
                transportationGroupId: wasteTransportationRequest.transportationGroupId,
                requestCreatorId: wasteTransportationRequest.requestCreatorId,
                requestApproverId: wasteTransportationRequest.requestApproverId,
            };

            await WasteTransportationRequestModel.update(updateModelObj, {
                where: { id: wasteTransportationRequest.id },
            });
            console.log('Waste source updated successfully');
        } catch (error) {
            console.error('Error updating Waste source:', error);
            throw new Error('Error updating Waste source');
        }
    }

    async deleteWasteTransportationRequest(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(
                WasteTransportationRequestModel,
                id,
            )) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await WasteTransportationRequestModel.update({ deletedBy }, { where: { id } });
            await WasteTransportationRequestModel.destroy({
                where: { id },
            });
            console.log('Waste source deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Waste source:', error);
            throw new Error('Error deleting Waste source');
        }
    }
}
