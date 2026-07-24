import EntitySettings from '../../../domain/entities/EntitySettings';
import { EntitySettingsModel, EntitySettingsAttributes } from '../models/EntitySetingsModel';
import EntitySettingsRepository from '../../../domain/repositories/EntitySettingsRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op, UniqueConstraintError } from 'sequelize';

export default class EntitySettingsRepositoryImpl implements EntitySettingsRepository {
    async checkDuplication(
        entityId: number,
        settingName: string,
        settingValue: string,
    ): Promise<boolean> {
        try {
            const data = await EntitySettingsModel.findOne({
                where: {
                    entityId: entityId,
                    settingName: settingName,
                    settingValue: settingValue,
                },
                attributes: ['id'],
            });

            if (data) {
                console.log('Waste source with this internal treatment name already exists');
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error('Error creating Waste source:', error);
            throw new Error('Error creating Waste source');
        }
    }

    async createEntitySettings(payload: EntitySettings): Promise<void> {
        try {
            if (!payload.createdBy) {
                throw new Error('Missing required fields for EntitySettings');
            }
            const createModelObj: EntitySettingsAttributes = {
                createdBy: payload.createdBy,
                updatedBy: payload.createdBy,
                entityId: payload.entityId,
                settingName: payload.settingName,
                settingValue: payload.settingValue,
            };

            console.log('createModelObj:', createModelObj);
            await EntitySettingsModel.create(createModelObj);
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

    async getEntitySettingsById(id: number): Promise<EntitySettings | null> {
        try {
            const existingData = (await checkExistingData(EntitySettingsModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            return new EntitySettings({
                id: existingData.get('id') as number | undefined,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                createdBy: existingData.get('createdBy'),
                updatedBy: existingData.get('updatedBy'),
                entityId: existingData.get('entityId'),
                settingName: existingData.get('settingName'),
                settingValue: existingData.get('settingValue'),
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getAllEntitySettingss(
        limit: number,
        page: number,
        search: string | undefined = undefined,
        entityId: string | undefined = undefined,
    ): Promise<{
        data: EntitySettings[];
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

            const { count, rows } = await EntitySettingsModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(search && { settingName: { [Op.like]: `%${search}%` } }),
                    ...(entityId && {
                        entityId: entityId,
                    }),
                },
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    return new EntitySettings({
                        id: m.get('id') as number | undefined,
                        createdAt: m.get('created_at'),
                        updatedAt: m.get('updated_at') as Date,
                        createdBy: m.get('createdBy'),
                        updatedBy: m.get('updatedBy'),
                        entityId: m.get('entityId'),
                        settingName: m.get('settingName'),
                        settingValue: m.get('settingValue'),
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

    async updateEntitySettings(payload: EntitySettings): Promise<void | null> {
        try {
            if (!payload.id) {
                throw new Error('Missing required fields for EntitySettings update');
            }

            const existingData = (await checkExistingData(EntitySettingsModel, payload.id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${payload.id} not found`);
                return null;
            }

            console.log(payload.updatedBy, 'payload.updatedBy');

            const updateModelObj = {
                updatedAt: new Date(),
                updatedBy: payload.updatedBy,
                entityId: payload.entityId,
                settingName: payload.settingName,
                settingValue: payload.settingValue,
            };

            await EntitySettingsModel.update(updateModelObj, {
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

    async deleteEntitySettings(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(EntitySettingsModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await EntitySettingsModel.update({ deletedBy }, { where: { id } });
            await EntitySettingsModel.destroy({
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
