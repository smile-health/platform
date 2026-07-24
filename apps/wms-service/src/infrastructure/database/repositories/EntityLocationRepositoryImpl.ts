import EntityLocation from '../../../domain/entities/EntityLocation';
import { EntityLocationModel, EntityLocationAttributes } from '../models/EntityLocationModel';
import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { UniqueConstraintError, Op } from 'sequelize';
import { paginationUtils } from '../../../shared/utils/pagination';
import InfraRegistry from './infraRegistry';
import { getEntityDetail } from '../../external-apis/thirdPartyClient';

export default class EntityLocationRepositoryImpl implements EntityLocationRepository {
    async createEntityLocationHF(payload: EntityLocation): Promise<void | string> {
        try {
            if (!payload.createdBy) {
                throw new Error('Missing required fields for EntityLocation');
            }

            const data = await EntityLocationModel.findOne({
                where: {
                    ...(payload.entityId && {
                        entity_id: payload.entityId,
                    }),
                },
            });

            if (data) {
                return 'Data already exist'
            }

            const createModelObj: EntityLocationAttributes = {
                createdBy: payload.createdBy,
                updatedBy: payload.createdBy,
                entityId: payload.entityId,
                locationName: payload.locationName,
                latitude: payload.latitude,
                longitude: payload.longitude,
                distanceLimitInMeters: payload.distanceLimitInMeters,
                address: payload.address,
                provinceId: payload.provinceId,
                cityId: payload.cityId,
                provinceName: payload.provinceName,
                cityName: payload.cityName,
                locationType: payload.locationType,
            };

            console.log('createModelObj:', createModelObj);
            await EntityLocationModel.create(createModelObj);
            console.log('Waste source created successfully');
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Data creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating data: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating data');
            }
        }
    }

    async createEntityLocationTP(payload: EntityLocation): Promise<void | string> {
        try {
            const createModelObj: EntityLocationAttributes = {
                createdBy: payload.createdBy,
                updatedBy: payload.createdBy,
                entityId: payload.entityId,
                locationName: payload.locationName,
                latitude: payload.latitude,
                longitude: payload.longitude,
                distanceLimitInMeters: payload.distanceLimitInMeters,
                address: payload.address,
                provinceId: payload.provinceId,
                cityId: payload.cityId,
                provinceName: payload.provinceName,
                cityName: payload.cityName,
                locationType: payload.locationType,
            };

            console.log('createModelObj:', createModelObj);
            await EntityLocationModel.create(createModelObj);
            console.log('Waste source created successfully');
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Data creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating data: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating data');
            }
        }
    }

    async getEntityLocationById(id: number, token: string): Promise<EntityLocation | null> {
        try {
            const existingData = (await checkExistingData(EntityLocationModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }
            const dataEntity = await getEntityDetail(existingData.get('entityId'), token);

            return new EntityLocation({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.get('createdBy'),
                updatedBy: existingData.get('updatedBy'),
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                entityId: existingData.get('entityId'),
                locationName: existingData.get('locationName'),
                latitude: existingData.get('latitude'),
                longitude: existingData.get('longitude'),
                distanceLimitInMeters: existingData.get('distanceLimitInMeters'),
                address: existingData.get('address'),
                provinceId: existingData.get('provinceId'),
                cityId: existingData.get('cityId'),
                provinceName: existingData.get('provinceName'),
                cityName: existingData.get('cityName'),
                entityName: dataEntity?.name,
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getAllEntityLocationsById(entityId: string): Promise<EntityLocationAttributes[] | null> {
        try {
            const data = await EntityLocationModel.findAll({
                where: {
                    ...(entityId && {
                        entity_id: entityId,
                    }),
                },
            });

            if (!data) {
                return null;
            }

            const locations = data.map((d: EntityLocationModel) => {
                const result = d.get({ plain: true });

                return {
                    id: result.id || d.get('id'),
                    createdBy: result.createdBy,
                    updatedBy: result.updatedBy,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at,
                    entityId: result.entityId,
                    locationName: result.locationName,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    distanceLimitInMeters: result.distanceLimitInMeters,
                    address: result.address,
                    provinceId: result.provinceId,
                    cityId: result.cityId,
                    provinceName: result.provinceName,
                    cityName: result.cityName,
                };
            });

            return locations;
        } catch (error) {
            console.error('Error retrieving waste sources:', error);
            throw new Error('Error retrieving waste sources');
        }
    }

    async getAllEntityLocationsPartnership(
        entityId: string,
        healtcareFacilityId?: number,
        wasteClassificationId?: number,
    ): Promise<EntityLocationAttributes[] | null> {
        try {
            const listEntityCheck: string[] = [entityId];
            const partnership =
                await InfraRegistry.partnershipRepositoryImpl!.findAllPartnershipByCondition({
                    transporterId: entityId,
                    ...(healtcareFacilityId && { consumerId: healtcareFacilityId }),
                    ...(wasteClassificationId && { wasteClassificationId: wasteClassificationId }),
                    providerType: {
                        [Op.in]: ['TRANSPORTER'],
                    },
                    partnershipStatus: 'ACTIVE',
                });

            console.log(partnership, 'partnership');

            if (partnership) {
                partnership.map((data) => listEntityCheck.push(data.providerId.toString()));
            }

            const data = await EntityLocationModel.findAll({
                where: {
                    ...(entityId && {
                        entity_id: {
                            [Op.in]: listEntityCheck,
                        },
                    }),
                },
            });

            if (!data) {
                return null;
            }

            const locations = data.map((d: EntityLocationModel) => {
                const result = d.get({ plain: true });

                return {
                    id: result.id || d.get('id'),
                    createdBy: result.createdBy,
                    updatedBy: result.updatedBy,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at,
                    entityId: result.entityId,
                    locationName: result.locationName,
                    latitude: result.latitude,
                    longitude: result.longitude,
                    distanceLimitInMeters: result.distanceLimitInMeters,
                    address: result.address,
                    provinceId: result.provinceId,
                    cityId: result.cityId,
                    provinceName: result.provinceName,
                    cityName: result.cityName,
                };
            });

            return locations;
        } catch (error) {
            console.error('Error retrieving waste sources:', error);
            throw new Error('Error retrieving waste sources');
        }
    }

    async getAllEntityLocationsTP(
        limit: number,
        page: number,
        search: string | undefined,
        entityId: string | undefined = undefined,
    ): Promise<{
        data: EntityLocation[];
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

            const { count, rows } = await EntityLocationModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(entityId && {
                        entity_id: entityId,
                    }),
                    ...(search && {
                        location_name: { [Op.like]: `%${search}%` },
                    }),
                },
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (item: any) => {
                        return new EntityLocation({
                            id: item.get('id'),
                            createdBy: item.get('createdBy'),
                            updatedBy: item.get('updatedBy'),
                            createdAt: item.get('created_at'),
                            updatedAt: item.get('updated_at'),
                            entityId: item.get('entityId'),
                            locationName: item.get('locationName'),
                            latitude: item.get('latitude'),
                            longitude: item.get('longitude'),
                            distanceLimitInMeters: item.get('distance_limitIn_meters'),
                            address: item.get('address'),
                            provinceId: item.get('provinceId'),
                            cityId: item.get('cityId'),
                            provinceName: item.get('provinceName'),
                            cityName: item.get('cityName'),
                        });
                    }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving waste sources:', error);
            throw new Error('Error retrieving waste sources');
        }
    }

    async getAllEntityLocationsSuperAdmin(
        limit: number,
        page: number,
        locationType: string,
        search: string | undefined,
        entityId: string | undefined = undefined,
    ): Promise<{
        data: EntityLocation[];
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

            const { count, rows } = await EntityLocationModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(entityId && {
                        entity_id: entityId,
                    }),
                    ...(locationType && {
                        location_type: locationType,
                    }),
                    ...(search && {
                        location_name: { [Op.like]: `%${search}%` },
                    }),
                },
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (item: any) => {
                        return new EntityLocation({
                            id: item.get('id'),
                            createdBy: item.get('createdBy'),
                            updatedBy: item.get('updatedBy'),
                            createdAt: item.get('created_at'),
                            updatedAt: item.get('updated_at'),
                            entityId: item.get('entityId'),
                            locationName: item.get('locationName'),
                            latitude: item.get('latitude'),
                            longitude: item.get('longitude'),
                            distanceLimitInMeters: item.get('distance_limitIn_meters'),
                            address: item.get('address'),
                            provinceId: item.get('provinceId'),
                            cityId: item.get('cityId'),
                            provinceName: item.get('provinceName'),
                            cityName: item.get('cityName'),
                        });
                    }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving waste sources:', error);
            throw new Error('Error retrieving waste sources');
        }
    }

    async updateEntityLocation(payload: EntityLocation): Promise<void | null> {
        try {
            if (!payload.id) {
                throw new Error('Missing required fields for EntityLocation update');
            }

            const existingData = (await checkExistingData(EntityLocationModel, payload.id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${payload.id} not found`);
                return null;
            }

            console.log(payload.updatedBy, 'payload.updatedBy');

            const updateModelObj = {
                updatedAt: new Date(),
                updatedBy: payload.createdBy,
                entityId: payload.entityId,
                locationName: payload.locationName,
                latitude: payload.latitude,
                longitude: payload.longitude,
                distanceLimitInMeters: payload.distanceLimitInMeters,
                address: payload.address,
                provinceId: payload.provinceId,
                cityId: payload.cityId,
                provinceName: payload.provinceName,
                cityName: payload.cityName,
            };

            await EntityLocationModel.update(updateModelObj, {
                where: { id: payload.id },
            });
            console.log('Waste source updated successfully');
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Data creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating data: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating data');
            }
        }
    }

    async deleteEntityLocation(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(EntityLocationModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await EntityLocationModel.update({ deletedBy }, { where: { id } });
            await EntityLocationModel.destroy({
                where: { id },
            });
            console.log('Waste source deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Waste source:', error);
            throw new Error('Error deleting Waste source');
        }
    }

    async validateDistanceLimit(
        id: number,
        longitude: number,
        latitude: number,
    ): Promise<{ result: boolean; distance: number } | null> {
        try {
            const data = await EntityLocationModel.findByPk(id);

            if (!data) {
                return null;
            }

            const result = data.get({ plain: true });

            const distance = this.calculateDistance(
                result.latitude,
                result.longitude,
                latitude,
                longitude,
            );

            const distanceLimit = result.distanceLimitInMeters as number;

            return {
                result: distance === 0 || distance <= distanceLimit,
                distance: distance,
            };
        } catch (error) {
            console.error('Error deleting Waste source:', error);
            throw new Error('Error deleting Waste source');
        }
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(lat1)) *
                Math.cos(this.degreesToRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    private degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
