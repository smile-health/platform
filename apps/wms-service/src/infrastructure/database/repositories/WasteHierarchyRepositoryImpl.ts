import WasteHierarchy from '../../../domain/entities/WasteHierarchy';
import { WasteHierarchyAttributes, WasteHierarchyModel } from '../models/WasteHierarchyModel';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';
import {
    checkExistingData,
    checkExistingDataWithColumns,
} from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op, QueryTypes, WhereOptions } from 'sequelize';
import WasteClassificationModel from '../models/WasteClassificationModel';
import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import { sequelize } from '../db.connection';
import { getUsersDetail } from '../../external-apis/thirdPartyClient';

export default class WasteHierarchyImpl implements WasteHierarchyRepository {
    async createWasteHierarchy(wasteHierarchy: WasteHierarchy): Promise<void> {
        try {
            if (!wasteHierarchy.createdBy || !wasteHierarchy.name) {
                throw new Error('Missing required fields for WasteHierarchy');
            }

            const createModelObj: WasteHierarchyAttributes = {
                createdBy: wasteHierarchy.createdBy,
                updatedBy: wasteHierarchy.createdBy,
                parentHierarchyId: wasteHierarchy.parentHierarchyId,
                name: wasteHierarchy.name,
                nameEn: wasteHierarchy.nameEn ?? wasteHierarchy.name,
                regionId: wasteHierarchy.regionId,
                description: wasteHierarchy.description,
                descriptionEn: wasteHierarchy.descriptionEn ?? wasteHierarchy.description,
                level: wasteHierarchy.level,
                isResidue: wasteHierarchy.isResidue,
                isActive: wasteHierarchy.isActive,
            };
            console.log('createModelObj:', createModelObj);
            await WasteHierarchyModel.create(createModelObj);
            console.log('Waste Hierarchy created successfully');
        } catch (error) {
            console.error('Error creating Waste Hierarchy:', error);
            throw new Error('Error creating Waste Hierarchy');
        }
    }
    async getWasteHierarchyById(id: string): Promise<WasteHierarchy | null> {
        try {
            const existingData: any = await WasteHierarchyModel.findOne({
                where: {
                    id: id,
                },
                include: [
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteType',
                        required: false,
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'parentHierarchyId',
                            'nameEn',
                            'descriptionEn',
                        ],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteGroup',
                        required: false,
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'parentHierarchyId',
                            'nameEn',
                            'descriptionEn',
                        ],
                    },
                ],
            });

            if (!existingData) {
                console.error(`Waste hierarchy with ID ${id} not found`);
                return null;
            }

            let dataWasteType: any = existingData.get('wasteType');
            let dataWasteGroup: any = existingData.get('wasteGroup');

            if (existingData.level == 2) {
                if (existingData.wasteGroup?.parentHierarchyId != null) {
                    dataWasteType = await WasteHierarchyModel.findOne({
                        where: {
                            id: dataWasteGroup.parentHierarchyId,
                        },
                    });
                }
            }

            const wasteHierarchyData = new WasteHierarchy({
                id: existingData.id as number | undefined,
                name: existingData.name,
                nameEn: existingData.nameEn,
                description: existingData.description,
                descriptionEn: existingData.descriptionEn,
                parentHierarchyId: existingData.parentHierarchyId,
                regionId: existingData.regionId,
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                updatedBy: existingData.updatedBy,
                createdBy: existingData.createdBy,
                level: existingData.level,
                isResidue: existingData.isResidue,
                isActive: existingData.isActive,
                wasteType: dataWasteType
                    ? {
                          id: dataWasteType.id,
                          name: dataWasteType.name,
                          nameEn: dataWasteType.nameEn,
                          regionId: dataWasteType.regionId,
                          description: dataWasteType.description,
                          descriptionEn: dataWasteType.descriptionEn,
                          parentHierarchyId: dataWasteType.parentHierarchyId,
                      }
                    : undefined,
                wasteGroup: dataWasteGroup
                    ? {
                          id: dataWasteGroup.id,
                          name: dataWasteGroup.name,
                          nameEn: dataWasteGroup.nameEn,
                          regionId: dataWasteGroup.regionId,
                          description: dataWasteGroup.description,
                          descriptionEn: dataWasteGroup.descriptionEn,
                          parentHierarchyId: dataWasteGroup.parentHierarchyId,
                      }
                    : undefined,
            });
            console.log('Waste hierarchy retrieved successfully:', wasteHierarchyData);
            return wasteHierarchyData;
        } catch (error) {
            console.error('Error retrieving waste hierarchy:', error);
            throw new Error('Error retrieving waste hierarchy');
        }
    }

    async getWasteHierarchyByParentHierarchyId(
        parentHierarchyId: string | null,
    ): Promise<WasteHierarchy[]> {
        try {
            const wasteHierarchy = await WasteHierarchyModel.findAll({
                where: { parentHierarchyId: parentHierarchyId, isActive: 1 },
            });
            let dataWasteHierarchy = await Promise.all(
                wasteHierarchy.map(async (data: any) => {
                    let dataWasteClassification: any;
                    if (data.level == 2) {
                        dataWasteClassification = await WasteClassificationModel.findOne({
                            where: {
                                wasteCharacteristicsId: data.id,
                            },
                        });
                    }
                    return new WasteHierarchy({
                        id: data.id as number | undefined,
                        name: data.name,
                        nameEn: data.nameEn,
                        description: data.description,
                        regionId: data.regionId,
                        parentHierarchyId: data.parentHierarchyId,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at as Date,
                        updatedBy: data.updatedBy,
                        createdBy: data.createdBy,
                        level: data.level,
                        isActive: data.isActive,
                        isResidue: data.isResidue,
                        wasteClassification: dataWasteClassification
                            ? {
                                  id: dataWasteClassification.dataValues.id,
                                  wasteCode: dataWasteClassification.dataValues.wasteCode,
                              }
                            : undefined,
                    });
                }),
            );
            console.log('Waste hierarchy retrieved successfully:', dataWasteHierarchy);
            return dataWasteHierarchy;
        } catch (error) {
            console.error('Error retrieving waste hierarchy:', error);
            throw new Error('Error retrieving waste hierarchy');
        }
    }

    async getWasteHierarchyByParentHierarchyIdNull(): Promise<WasteHierarchy[]> {
        try {
            const wasteHierarchy = await WasteHierarchyModel.findAll({
                where: {
                    parentHierarchyId: {
                        [Op.is]: null,
                    },
                    isActive: 1,
                },
            });

            const wasteHierarchyData = wasteHierarchy.map((group: any) => {
                return new WasteHierarchy({
                    id: group.id as number | undefined,
                    name: group.name,
                    nameEn: group.nameEn,
                    description: group.description,
                    descriptionEn: group.descriptionEn,
                    regionId: group.regionId,
                    parentHierarchyId: group.parentHierarchyId,
                    createdAt: group.created_at,
                    updatedAt: group.updated_at as Date,
                    updatedBy: group.updatedBy,
                    createdBy: group.createdBy,
                    level: group.level,
                    isResidue: group.isResidue,
                    isActive: group.isActive,
                });
            });
            console.log('Waste hierarchy retrieved successfully:', wasteHierarchyData);
            return wasteHierarchyData;
        } catch (error) {
            console.error('Error retrieving waste hierarchy:', error);
            throw new Error('Error retrieving waste hierarchy');
        }
    }

    async getAllWasteHierarchy(
        limit: number,
        page: number,
        token: string,
        search: string | undefined = undefined,
        level: number | undefined = undefined,
        wasteTypeId?: number,
        wasteGroupId?: number,
        isActive?: number,
    ): Promise<{
        data: WasteHierarchy[];
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

            const safeIsActive =
                isActive !== undefined && !isNaN(Number(isActive)) ? Number(isActive) : 1;
            const where: any = {
                ...(typeof level !== 'undefined' && { level }),
                isActive: safeIsActive,
                ...(search && { name: { [Op.like]: `%${search}%` } }),
            };

            const include: any[] = [];

            if (level === 2) {
                include.push({
                    model: WasteHierarchyModel,
                    as: 'wasteGroup',
                    required: true,
                    attributes: [
                        'id',
                        'name',
                        'description',
                        'parentHierarchyId',
                        'nameEn',
                        'descriptionEn',
                    ],
                    where: {
                        level: 1,
                        ...(wasteGroupId && { id: wasteGroupId }),
                    },
                    include: [
                        {
                            model: WasteHierarchyModel,
                            as: 'wasteType',
                            required: true,
                            attributes: [
                                'id',
                                'name',
                                'description',
                                'parentHierarchyId',
                                'nameEn',
                                'descriptionEn',
                            ],
                            where: {
                                level: 0,
                                ...(wasteTypeId && { id: wasteTypeId }),
                            },
                        },
                    ],
                });
            } else {
                include.push(
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteType',
                        required: !!wasteTypeId,
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'parentHierarchyId',
                            'nameEn',
                            'descriptionEn',
                        ],
                        where: wasteTypeId ? { id: wasteTypeId } : undefined,
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteGroup',
                        required: !!wasteGroupId,
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'parentHierarchyId',
                            'nameEn',
                            'descriptionEn',
                        ],
                        where: wasteGroupId ? { id: wasteGroupId } : undefined,
                    },
                );
            }

            const { count, rows } = await WasteHierarchyModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                where,
                include,
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (data: any) => {
                        const dataWasteGroup: any = data.get('wasteGroup');
                        let dataWasteType: any = data.get('wasteType');
                        if (dataWasteGroup) {
                            dataWasteType = dataWasteGroup.get('wasteType');
                        }
                        const dataUser = await getUsersDetail(data.updatedBy, token);

                        const fullName = [dataUser?.firstname, dataUser?.lastname]
                            .filter(Boolean)
                            .join(' ')

                        return new WasteHierarchy({
                            id: data.id,
                            name: data.name,
                            nameEn: data.nameEn,
                            description: data.description,
                            descriptionEn: data.descriptionEn,
                            regionId: data.regionId,
                            parentHierarchyId: data.parentHierarchyId,
                            createdAt: data.created_at,
                            updatedAt: data.updated_at,
                            updatedBy: data.updatedBy,
                            createdBy: data.createdBy,
                            level: data.level,
                            isResidue: data.isResidue,
                            isActive: data.isActive,
                            userName: fullName,
                            wasteType: dataWasteType
                                ? {
                                      id: dataWasteType.id,
                                      name: dataWasteType.name,
                                      description: dataWasteType.description,
                                      nameEn: dataWasteType.nameEn,
                                      descriptionEn: dataWasteType.descriptionEn,
                                      parentHierarchyId: dataWasteType.parentHierarchyId,
                                      regionId: dataWasteType.regionId,
                                  }
                                : undefined,
                            wasteGroup: dataWasteGroup
                                ? {
                                      id: dataWasteGroup.id,
                                      name: dataWasteGroup.name,
                                      description: dataWasteGroup.description,
                                      nameEn: dataWasteGroup.nameEn,
                                      descriptionEn: dataWasteGroup.descriptionEn,
                                      parentHierarchyId: dataWasteGroup.parentHierarchyId,
                                      regionId: dataWasteGroup.regionId,
                                  }
                                : undefined,
                        });
                    }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving waste hierarchy:', error);
            throw new Error('Error retrieving waste hierarchy');
        }
    }

    async updateWasteHierarchy(wasteHierarchy: WasteHierarchy): Promise<void | null> {
        try {
            if (!wasteHierarchy.id || !wasteHierarchy.updatedBy) {
                throw new Error('Missing required fields for WasteHierarchy update');
            }

            const existingData = (await checkExistingData(
                WasteHierarchyModel,
                wasteHierarchy.id,
            )) as any;

            if (!existingData) {
                console.error(`Waste hierarchy with ID ${wasteHierarchy.id} not found`);
                return null;
            }

            const updateModelObj = {
                updatedBy: wasteHierarchy.updatedBy,
                name: wasteHierarchy.name,
                parentHierarchyId: wasteHierarchy.parentHierarchyId,
                description: wasteHierarchy.description,
                updatedAt: new Date(),
                level: existingData.level,
                isResidue: wasteHierarchy.isResidue,
                isActive: wasteHierarchy.isActive,
            };

            await WasteHierarchyModel.update(updateModelObj, {
                where: { id: wasteHierarchy.id },
            });
            console.log('Waste hierarchy updated successfully');
        } catch (error) {
            console.error('Error updating Waste hierarchy:', error);
            throw new Error('Error updating Waste hierarchy');
        }
    }

    async deleteWasteHierarchy(id: string): Promise<boolean | string> {
        try {
            const existingData = (await checkExistingData(WasteHierarchyModel, id)) as any;

            if (!existingData) {
                return 'NOT_FOUND';
            }

            await WasteHierarchyModel.update({
                isActive: false
            },{
                where: { id },
            });
            console.log('Waste hierarchy deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Waste hierarchy:', error);
            throw new Error('Error deleting Waste hierarchy');
        }
    }

    async findWasteHierarchyByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<WasteHierarchy | null> {
        const data: any = await checkExistingDataWithColumns(WasteHierarchyModel, whereClause);

        if (!data) {
            return null;
        }

        return new WasteHierarchy({
            id: data.id,
            name: data.name,
            nameEn: data.nameEn,
            description: data.description,
            descriptionEn: data.descriptionEn,
            regionId: data.region_id,
            parentHierarchyId: data.parent_hierarchy_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            updatedBy: data.updated_by,
            createdBy: data.created_by,
            level: data.level,
            isResidue: data.isResidue,
            isActive: data.isActive,
        });
    }

    async explanationOfWasteClassification(): Promise<DashboardWasteHierarchy[]> {
        try {
            const dataSql = `
            SELECT
                wg.wasteTypeName,
                wg.wasteTypeNameEn,
                wg.wasteTypeDescription,
                wg.wasteTypeDescriptionEn,
                wg.wasteGroupName,
                wg.wasteGroupNameEn,
                wg.wasteGroupDescription,
                wg.wasteGroupDescriptionEn,
                wc.name AS "wasteCharacteristicsName",
                wc.name_en AS "wasteCharacteristicsNameEn",
                wc.description AS "wasteCharacteristicsDescription",
                wc.description_en AS "wasteCharacteristicsDescriptionEn"
            FROM waste_hierarchy wc
            JOIN (
                SELECT
                    wg.id,
                    wt.wasteTypeName,
                    wt.wasteTypeNameEn,
                    wt.description AS "wasteTypeDescription",
                    wt.wasteTypeDescriptionEn,
                    wg.name AS "wasteGroupName",
                    wg.name_en  "wasteGroupNameEn",
                    wg.description AS "wasteGroupDescription",
                    wg.description_en AS "wasteGroupDescriptionEn"
                FROM waste_hierarchy wg
                JOIN (
                    SELECT
                        wh.id,
                        wh.name AS "wasteTypeName",
                        wh.name_en "wasteTypeNameEn",
                        wh.description,
                        wh.description_en "wasteTypeDescriptionEn"
                    FROM waste_hierarchy wh
                    WHERE wh.level = 0
                ) wt ON wt.id = wg.parent_hierarchy_id
                WHERE wg.level = 1
            ) wg ON wg.id = wc.parent_hierarchy_id
            WHERE wc.level = 2 and wc.is_active = 1
        `;

            const data = await sequelize.query<DashboardWasteHierarchy>(dataSql, {
                type: QueryTypes.SELECT,
            });
            return data;
        } catch (error) {
            console.error('Error fetching explanationOfWasteClassification:', error);
            throw error;
        }
    }
}
