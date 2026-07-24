import WasteSource from '../../../domain/entities/WasteSource';
import { WasteSourceModel, WasteSourceAttributes } from '../models/WasteSourceModel';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op } from 'sequelize';
import { getUsersDetail } from '../../external-apis/thirdPartyClient';

export default class WasteSourceRepositoryImpl implements WasteSourceRepository {
    async checkDuplication(wasteSource: WasteSource): Promise<boolean> {
        try {
            const data = await WasteSourceModel.findOne({
                where: {
                    sourceType: 'INTERNAL_TREATMENT',
                    healthcareFacilityId: wasteSource.healthcareFacilityId,
                    internalTreatmentName: wasteSource.internalTreatmentName,
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

    async createWasteSource(wasteSource: WasteSource): Promise<void> {
        try {
            if (!wasteSource.createdBy) {
                throw new Error('Missing required fields for WasteSource');
            }
            const createModelObj: WasteSourceAttributes = {
                createdBy: wasteSource.createdBy,
                updatedBy: wasteSource.createdBy,
                healthcareFacilityId: wasteSource.healthcareFacilityId,
                sourceType: wasteSource.sourceType,
                internalSourceName: wasteSource.internalSourceName,
                internalTreatmentName: wasteSource.internalTreatmentName,
                externalHealthcareFacilityId: wasteSource.externalHealthcareFacilityId,
                externalHealthcareFacilityName: wasteSource.externalHealthcareFacilityName,
                isActive: wasteSource.isActive,
                isResidue: wasteSource.isResidue,
            };

            console.log('createModelObj:', createModelObj);
            await WasteSourceModel.create(createModelObj);
            console.log('Waste source created successfully');
        } catch (error) {
            console.error('Error creating Waste source:', error);
            throw new Error('Error creating Waste source');
        }
    }

    async getWasteSourceById(id: string): Promise<WasteSource | null> {
        try {
            const existingData = (await checkExistingData(WasteSourceModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            return new WasteSource({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.createdBy,
                updatedBy: existingData.updatedBy,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                healthcareFacilityId: existingData.healthcareFacilityId,
                sourceType: existingData.sourceType,
                internalSourceName: existingData.internalSourceName,
                internalTreatmentName: existingData.internalTreatmentName,
                externalHealthcareFacilityId: existingData.externalHealthcareFacilityId,
                externalHealthcareFacilityName: existingData.externalHealthcareFacilityName,
                isActive: existingData.isActive,
                isResidue: existingData.isResidue,
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getAllWasteSources(
        limit: number,
        page: number,
        token: string,
        entityId: number,
        search?: string,
        sourceType?: string,
    ): Promise<{
        data: WasteSource[];
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

            const { count, rows } = await WasteSourceModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    healthcareFacilityId: entityId,
                    ...(search && {
                        [Op.or]: [
                            { internalTreatmentName: { [Op.like]: `%${search}%` } },
                            { externalHealthcareFacilityName: { [Op.like]: `%${search}%` } },
                            { internalSourceName: { [Op.like]: `%${search}%` } },
                        ],
                    }),
                    ...(sourceType && {
                        source_type: sourceType,
                    }),
                },
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (m: any) => {
                        const dataUser = await getUsersDetail(m.updatedBy, token);
                        const fullName = [dataUser?.firstname, dataUser?.lastname]
                            .filter(Boolean)
                            .join(' ')

                        return new WasteSource({
                            id: m.get('id') as number | undefined,
                            createdBy: m.createdBy,
                            updatedBy: m.updatedBy,
                            createdAt: m.get('created_at'),
                            updatedAt: m.get('updated_at') as Date,
                            healthcareFacilityId: m.healthcareFacilityId,
                            sourceType: m.sourceType,
                            internalSourceName: m.internalSourceName,
                            internalTreatmentName: m.internalTreatmentName,
                            externalHealthcareFacilityId: m.externalHealthcareFacilityId,
                            externalHealthcareFacilityName: m.externalHealthcareFacilityName,
                            isActive: m.isActive,
                            isResidue: m.isResidue,
                            userName: fullName,
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

    async updateWasteSource(wasteSource: WasteSource): Promise<void | null> {
        try {
            if (!wasteSource.id || !wasteSource.updatedBy) {
                throw new Error('Missing required fields for WasteSource update');
            }

            const existingData = (await checkExistingData(WasteSourceModel, wasteSource.id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${wasteSource.id} not found`);
                return null;
            }

            if (wasteSource.sourceType === 'INTERNAL_TREATMENT') {
                const validation = await this.checkDuplication(wasteSource);
                if (!validation) {
                    console.error('Waste source with this internal treatment name already exists');
                    return null;
                }
            }

            const updateModelObj = {
                updatedBy: wasteSource.updatedBy,
                healthcareFacilityId: wasteSource.healthcareFacilityId,
                sourceType: wasteSource.sourceType,
                internalSourceName: wasteSource.internalSourceName,
                internalTreatmentName: wasteSource.internalTreatmentName,
                externalHealthcareFacilityId: wasteSource.externalHealthcareFacilityId,
                externalHealthcareFacilityName: wasteSource.externalHealthcareFacilityName,
                isActive: wasteSource.isActive,
                updatedAt: new Date(),
            };

            await WasteSourceModel.update(updateModelObj, {
                where: { id: wasteSource.id },
            });
            console.log('Waste source updated successfully');
        } catch (error) {
            console.error('Error updating Waste source:', error);
            throw new Error('Error updating Waste source');
        }
    }

    async deleteWasteSource(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(WasteSourceModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await WasteSourceModel.update({ deletedBy }, { where: { id } });
            await WasteSourceModel.destroy({
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
