import GlobalSettings from '../../../domain/entities/GlobalSettings';
import { GlobalSettingsModel, GlobalSettingsAttributes } from '../models/GlobalSettingsModel';
import GlobalSettingsRepository from '../../../domain/repositories/GlobalSettingsRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op, UniqueConstraintError } from 'sequelize';

export default class GlobalSettingsRepositoryImpl implements GlobalSettingsRepository {
    async checkDuplication(settingName: string, settingValue: string): Promise<boolean> {
        try {
            const data = await GlobalSettingsModel.findOne({
                where: {
                    setting_name: settingName,
                    setting_value: settingValue,
                },
                attributes: ['id'],
            });

            if (data) {
                console.log('Global Settings with this internal treatment name already exists');
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error('Error creating Global Settings:', error);
            throw new Error('Error creating Global Settings');
        }
    }

    async createGlobalSettings(payload: GlobalSettings): Promise<void> {
        try {
            if (!payload.createdBy) {
                throw new Error('Missing required fields for GlobalSettings');
            }
            const createModelObj: GlobalSettingsAttributes = {
                created_by: payload.createdBy,
                updated_by: payload.createdBy,
                setting_name: payload.settingName,
                setting_value: payload.settingValue,
            };

            console.log('createModelObj:', createModelObj);
            await GlobalSettingsModel.create(createModelObj);
            console.log('Global Settings created successfully');
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

    async getGlobalSettingsById(id: number): Promise<GlobalSettings | null> {
        try {
            const existingData = (await checkExistingData(GlobalSettingsModel, id)) as any;

            if (!existingData) {
                console.error(`Global Settings with ID ${id} not found`);
                return null;
            }

            return new GlobalSettings({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.get('created_by'),
                updatedBy: existingData.get('updated_by'),
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                settingName: existingData.get('setting_name'),
                settingValue: existingData.get('setting_value'),
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getAllGlobalSettingss(
        limit: number,
        page: number,
        search: string | undefined = undefined,
    ): Promise<{
        data: GlobalSettings[];
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

            const { count, rows } = await GlobalSettingsModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(search && { setting_name: { [Op.like]: `%${search}%` } }),
                },
            });

            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    return new GlobalSettings({
                        id: m.get('id') as number | undefined,
                        createdBy: m.get('created_by'),
                        updatedBy: m.get('updated_by'),
                        createdAt: m.get('created_at'),
                        updatedAt: m.get('updated_at') as Date,
                        settingName: m.get('setting_name'),
                        settingValue: m.get('setting_value'),
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

    async updateGlobalSettings(payload: GlobalSettings): Promise<void | null> {
        try {
            if (!payload.id) {
                throw new Error('Missing required fields for GlobalSettings update');
            }

            const existingData = (await checkExistingData(GlobalSettingsModel, payload.id)) as any;

            if (!existingData) {
                console.error(`Global Settings with ID ${payload.id} not found`);
                return null;
            }

            console.log(payload.updatedBy, 'payload.updatedBy');

            const updateModelObj = {
                updatedAt: new Date(),
                updated_by: payload.updatedBy,
                setting_name: payload.settingName,
                setting_value: payload.settingValue,
            };

            await GlobalSettingsModel.update(updateModelObj, {
                where: { id: payload.id },
            });
            console.log('Global Settings updated successfully');
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

    async deleteGlobalSettings(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(GlobalSettingsModel, id)) as any;

            if (!existingData) {
                console.error(`Global Settings with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await GlobalSettingsModel.update({ deletedBy }, { where: { id } });
            await GlobalSettingsModel.destroy({
                where: { id },
            });
            console.log('Global Settings deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Global Settings:', error);
            throw new Error('Error deleting Global Settings');
        }
    }
}
