import PartnershipVehicleMap from '../../../domain/entities/PartnershipVehicleMap';
import {
    PartnershipVehicleMapModel,
    PartnershipVehicleMapAttributes,
} from '../models/PartnershipVehicleMapModel';
import PartnershipVehicleMapRepository from '../../../domain/repositories/PartnershipVehicleMapRepository';
import { checkExistingDataWithColumn } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import PartnershipModel from '../models/PartnershipModel';
import { PartnerVehicleAttributes, PartnerVehicleModel } from '../models/PartnerVehicleModel';

export default class PartnershipVehicleMapRepositoryImpl
    implements PartnershipVehicleMapRepository
{
    async createPartnershipVehicleMap(partnershipVehicleMap: PartnershipVehicleMap): Promise<void> {
        try {
            if (!partnershipVehicleMap.vehicleId || !partnershipVehicleMap.partnershipId) {
                throw new Error('Missing required fields for PartnershipVehicleMap');
            }
            const createModelObj: PartnershipVehicleMapAttributes = {
                partnership_id: partnershipVehicleMap.partnershipId,
                vehicle_id: partnershipVehicleMap.vehicleId,
            };
            console.log('createModelObj:', createModelObj);
            await PartnershipVehicleMapModel.create(createModelObj);
            console.log('Partnership VehicleMap created successfully');
        } catch (error) {
            console.error('Error creating Partnership VehicleMap:', error);
            throw new Error('Error creating Partnership VehicleMap');
        }
    }

    async getAllPartnershipVehicleMaps(
        limit: number,
        page: number,
        search: string | undefined = undefined,
    ): Promise<{
        data: PartnershipVehicleMap[];
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

            const { count, rows } = await PartnershipVehicleMapModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['partnership_id', 'ASC']],
                where: {},
                include: [
                    {
                        model: PartnershipModel,
                        as: 'partnership',
                        attributes: ['id', 'consumer_id'],
                        where: {
                            ...(search && {
                                consumer_id: Number(search),
                            }),
                        },
                        required: true,
                    },
                    {
                        model: PartnerVehicleModel,
                        as: 'partnerVehicle',
                        attributes: [
                            'id',
                            'entityId',
                            'vehicleType',
                            'vehicleNumber',
                            'capacityInKgs',
                        ],
                        required: true,
                    },
                ],
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    const partnerVehicleData = m.get(
                        'partnerVehicle',
                    ) as PartnerVehicleAttributes | null;

                    return new PartnershipVehicleMap({
                        partnershipId: m.get('partnership_id'),
                        vehicleId: m.get('vehicle_id'),
                        partnerVehicle: partnerVehicleData
                            ? {
                                  id: partnerVehicleData.id,
                                  entityId: partnerVehicleData.entityId,
                                  vehicleType: partnerVehicleData.vehicleType,
                                  vehicleNumber: partnerVehicleData.vehicleNumber,
                                  capacityInKgs: partnerVehicleData.capacityInKgs,
                              }
                            : undefined,
                    });
                }),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving Partnership Vehicle Maps:', error);
            throw new Error('Error retrieving Partnership Vehicle Maps');
        }
    }

    async updatePartnershipVehicleMap(
        partnershipVehicleMap: PartnershipVehicleMap,
    ): Promise<void | null> {
        try {
            if (!partnershipVehicleMap.vehicleId || !partnershipVehicleMap.partnershipId) {
                throw new Error('Missing required fields for Partnership Vehicle Map update');
            }

            const existingData = (await checkExistingDataWithColumn(
                PartnershipVehicleMapModel,
                partnershipVehicleMap.vehicleId,
                'vehicel_id',
            )) as any;

            if (!existingData) {
                console.error(
                    `Partnership VehicleMap with vehicleId ${partnershipVehicleMap.vehicleId} not found`,
                );
                return null;
            }

            const updateModelObj = {
                partnership_id: partnershipVehicleMap.partnershipId,
                vehicle_id: partnershipVehicleMap.vehicleId,
            };

            await existingData.update(updateModelObj);
            console.log('Partnership VehicleMap updated successfully');
        } catch (error) {
            console.error('Error updating Partnership VehicleMap:', error);
            throw new Error('Error updating Partnership VehicleMap');
        }
    }

    async deletePartnershipVehicleMap(
        partnershipId: number,
        vehicleId: number,
        deletedBy?: number,
    ): Promise<boolean | null> {
        try {
            const existingData = await PartnershipVehicleMapModel.findOne({
                where: {
                    partnership_id: partnershipId,
                    vehicle_id: vehicleId,
                },
            });

            if (!existingData) {
                console.error(
                    `Partnership VehicleMap with partnershipId ${partnershipId} and vehicleId ${vehicleId} not found`,
                );
                return null;
            }

            if (deletedBy) await existingData.update({ deletedBy });
            await existingData.destroy();
            console.log('Partnership VehicleMap deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Partnership VehicleMap:', error);
            throw new Error('Error deleting Partnership VehicleMap');
        }
    }
}
