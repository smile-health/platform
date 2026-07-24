import WasteBagTreatmentGroupRepository from '../../../domain/repositories/WasteBagTreatmentGroupRepository';
import { getTotalWeightFromWasteBags } from '../../../shared/utils/wasteMiscellaneous';
import WasteBagModel from '../models/WasteBagModel';
import { WasteBagTreatmentGroupModel } from '../models/WasteBagTreatmentGroupModel';
import InfraRegistry from './infraRegistry';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op, QueryTypes, Transaction, UniqueConstraintError } from 'sequelize';
import WasteTreatmentGroup, {
    WasteTreatmentGroupSelectDto,
} from '../../../domain/entities/WasteBagTreatmentGroup';
import generateWasteGroupId from '../../../shared/utils/generateWasteGroupId';
import WasteClassificationModel from '../../../infrastructure/database/models/WasteClassificationModel';
import WasteHierarchyModel from '../../../infrastructure/database/models/WasteHierarchyModel';
import { PartnerVehicleModel } from '../models/PartnerVehicleModel';
import { sequelize } from '../db.connection';
import { getLogHistories } from '../../../shared/utils/logHistories';
import { handleAnalisisProcessCount } from '../../../shared/utils/countProsessEvent';
import {
    buildBagWasteClassification,
    buildGroupWasteClassificationSummary,
} from '../../../shared/utils/wasteClassificationSummary';

export default class WasteBagTreatmentGroupImpl implements WasteBagTreatmentGroupRepository {
    async getWasteBagTreatmentGroupById(id: number): Promise<WasteBagTreatmentGroupModel | null> {
        try {
            const wasteBagTreatmentGroup = await WasteBagTreatmentGroupModel.findByPk(id);
            return wasteBagTreatmentGroup || null;
        } catch (error) {
            console.error('Error fetching WasteBagTreatmentGroup by ID:', error);
            throw new Error('Database error');
        }
    }

    async getWasteBagTreatmentGroupByIdWithWasteBags(
        token: string,
        id?: number,
        qrCodeId?: string,
    ): Promise<WasteTreatmentGroup | null> {
        try {
            const wasteBagTreatmentGroup = await WasteBagTreatmentGroupModel.findOne({
                where: {
                    ...(id && {
                        id: id,
                    }),
                },
                include: [
                    {
                        model: WasteBagModel,
                        as: 'wasteBags',
                        required: qrCodeId ? true : false,
                        where: {
                            ...(qrCodeId && {
                                wasteBagQrCodeId: qrCodeId,
                            }),
                        },
                    },
                ],
            });

            if (!wasteBagTreatmentGroup) {
                return null;
            }

            const result = await wasteBagTreatmentGroup.get({ plain: true });

            const firstBag = result.wasteBags;

            const distinctWasteClassificationIds = [
                ...new Set(result.wasteBags.map((bag: any) => bag.wasteClassificationId as number)),
            ] as number[];
            const classifications = await WasteClassificationModel.findAll({
                where: { id: { [Op.in]: distinctWasteClassificationIds } },
                include: [
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteType',
                        required: true,
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteGroup',
                        required: true,
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteCharacteristics',
                        required: true,
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'isActive',
                            'nameEn',
                            'descriptionEn',
                        ],
                    },
                ],
            });
            const classificationMap = new Map(classifications.map((c) => [c.dataValues.id, c]));

            const wasteBags = await Promise.all(
                result.wasteBags.map(async (bag: any) => {
                    const [logHistory, manifestDocPath] = await Promise.all([
                        getLogHistories(bag.id),
                        bag.manifestDocPath
                            ? InfraRegistry.s3FileServiceRepositoryImpl!.getPresignedUrl(
                                  bag.manifestDocPath,
                              )
                            : Promise.resolve(bag.manifestDocPath),
                    ]);

                    return {
                        ...bag,
                        logHistory,
                        manifestDocPath,
                        treatmentMethod: classificationMap.get(bag.wasteClassificationId)
                            ?.dataValues?.treatmentMethod,
                        wasteClassification: buildBagWasteClassification(
                            classificationMap.get(bag.wasteClassificationId),
                        ),
                    };
                }),
            );

            const { wasteType, wasteGroup, wasteCharacteristics } =
                buildGroupWasteClassificationSummary([...classificationMap.values()]);

            const partnership =
                await InfraRegistry.partnershipRepositoryImpl?.getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId(
                    token,
                    firstBag[0].healthcareFacilityId,
                    firstBag[0].wasteClassificationId,
                );

            const vehicleData = await PartnerVehicleModel.findByPk(
                firstBag[0].transporterVehicleId,
            );

            const primaryClassification = classificationMap.get(firstBag[0].wasteClassificationId);
            const processWastebagEnd = handleAnalisisProcessCount(
                primaryClassification?.dataValues?.disposalMethod,
                primaryClassification?.dataValues?.treatmentMethod,
                firstBag[0].isTreated as boolean,
                firstBag[0].wasteGroupIds,
                firstBag[0].wasteStatus
            );

            return new WasteTreatmentGroup({
                id: result.id,
                createdBy: result.createdBy,
                updatedBy: result.updatedBy,
                createdAt: result.created_at as Date,
                updatedAt: result.updated_at as Date,
                totalBagsCount: result.totalBagsCount,
                totalWeightInKgs: result.totalWeightInKgs,
                treatmentAssetId: result.treatmentAssetId,
                treatmentOperatorId: result.treatmentOperatorId,
                handoverLattitude: result.handoverLattitude,
                handoverLongitude: result.handoverLongitude,
                treatmentStatus: result.treatmentStatus,
                handoverTimestamp: result.handoverTimestamp,
                isReadOnly: result.isReadOnly,
                groupId: result.groupId,
                wasteBags: wasteBags,
                wasteType,
                wasteGroup,
                wasteCharacteristics,
                partnership: partnership,
                vehicle: vehicleData,
                processWastebagEnd: processWastebagEnd,
            });
        } catch (error) {
            console.error('Error fetching WasteBagTreatmentGroup by ID:', error);
            throw new Error('Database error :' + error);
        }
    }

    async createWasteBagTreatmentGroup(
        wasteBagIds: string[],
        createdBy: string,
        status:
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED',
    ): Promise<number> {
        try {
            const wasteBags =
                await InfraRegistry.wasteBagRepositoryImpl!.getWasteBagsByIds(wasteBagIds);
            if (!wasteBags?.length) {
                throw new Error('Waste bag not found for the given ids');
            }

            const groupId = generateWasteGroupId(wasteBagIds, status);

            const wasteBagTreatmentGroup = await WasteBagTreatmentGroupModel.create({
                createdBy: createdBy,
                totalBagsCount: wasteBags.length,
                totalWeightInKgs: getTotalWeightFromWasteBags(wasteBags),
                treatmentStatus: status,
                updatedBy: createdBy,
                groupId: groupId,
            });

            return wasteBagTreatmentGroup.id!;
        } catch (error) {
            console.error('Error creating WasteBagTreatmentGroup:', error);
            throw new Error('Database error');
        }
    }

    async createWasteBagTreatmentGroupFromBags(
        wasteBags: WasteBagModel[],
        wasteBagIds: string[],
        createdBy: string,
        status:
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED',
    ): Promise<number> {
        try {
            if (!wasteBags?.length) {
                throw new Error('Waste bag not found for the given ids');
            }

            const groupId = generateWasteGroupId(wasteBagIds, status);

            const wasteBagTreatmentGroup = await WasteBagTreatmentGroupModel.create({
                createdBy: createdBy,
                totalBagsCount: wasteBags.length,
                totalWeightInKgs: getTotalWeightFromWasteBags(wasteBags),
                treatmentStatus: status,
                updatedBy: createdBy,
                groupId: groupId,
            });

            return wasteBagTreatmentGroup.id!;
        } catch (error) {
            console.error('Error creating WasteBagTreatmentGroup:', error);
            throw new Error('Database error');
        }
    }

    async getAllWasteTreatMentGroup(
        limit: number,
        page: number,
        entityId?: number,
        startDate?: Date,
        endDate?: Date,
        status?:
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT'
            | 'READY_FOR_TREATMENT'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED',
    ): Promise<{
        data: WasteTreatmentGroup[];
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

            const { count, rows } = await WasteBagTreatmentGroupModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(startDate &&
                        endDate && {
                            created_at: {
                                [Op.gte]: new Date(startDate),
                                [Op.lt]: new Date(endDate).setDate(new Date(endDate).getDate() + 1),
                            },
                        }),
                },
                include: [
                    {
                        model: WasteBagModel,
                        as: 'wasteBags',
                        required: true,
                        where: {
                            ...(entityId && {
                                [Op.or]: [
                                    { healthcareFacilityId: entityId },
                                    { transporterId: entityId },
                                    { thirdPartyId: entityId },
                                ],
                            }),
                            ...(status && {
                                wasteStatus: status,
                            }),
                        },
                    },
                ],
            });

            if (count === 0 || rows.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        pages: 0,
                        currentPage: safePage,
                        perPage: safeLimit,
                    },
                };
            }

            const plainRows = rows.map((data) => data.get({ plain: true }));

            // Bulk fetch classifications once for all rows (avoids N+1 queries in the loop below)
            const allClassificationIds = [
                ...new Set(
                    plainRows.flatMap((row: any) =>
                        row.wasteBags.map((bag: any) => bag.wasteClassificationId),
                    ),
                ),
            ] as number[];

            const classifications = await WasteClassificationModel.findAll({
                where: { id: { [Op.in]: allClassificationIds } },
                include: [
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteType',
                        required: true,
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteGroup',
                        required: true,
                        attributes: ['id', 'name', 'description', 'nameEn', 'descriptionEn'],
                    },
                    {
                        model: WasteHierarchyModel,
                        as: 'wasteCharacteristics',
                        required: true,
                        where: { isActive: true },
                        attributes: [
                            'id',
                            'name',
                            'description',
                            'isActive',
                            'nameEn',
                            'descriptionEn',
                        ],
                    },
                ],
            });
            const classificationMap = new Map(classifications.map((c) => [c.dataValues.id, c]));

            const processedData = plainRows.map((result: any) => {
                // Get the first waste bag from this group
                const firstBag = result.wasteBags[0];

                if (!firstBag) {
                    return null;
                }

                const bagClassifications = result.wasteBags.map((bag: any) =>
                    classificationMap.get(bag.wasteClassificationId),
                );

                if (!bagClassifications.some(Boolean)) {
                    return null;
                }

                const { wasteType, wasteGroup, wasteCharacteristics } =
                    buildGroupWasteClassificationSummary(bagClassifications);

                return new WasteTreatmentGroup({
                    id: result.id,
                    createdBy: result.createdBy,
                    updatedBy: result.updatedBy,
                    createdAt: result.created_at as Date,
                    updatedAt: result.updated_at as Date,
                    totalBagsCount: result.totalBagsCount,
                    totalWeightInKgs: result.totalWeightInKgs,
                    treatmentAssetId: result.treatmentAssetId,
                    treatmentOperatorId: result.treatmentOperatorId,
                    handoverLattitude: result.handoverLattitude,
                    handoverLongitude: result.handoverLongitude,
                    treatmentStatus: result.treatmentStatus,
                    handoverTimestamp: result.handoverTimestamp,
                    wasteBags: result.wasteBags.map((bag: any) => ({
                        ...bag,
                        qr_code: bag.wasteBagQrCodeId,
                        wasteClassification: buildBagWasteClassification(
                            classificationMap.get(bag.wasteClassificationId),
                        ),
                    })),
                    wasteType,
                    wasteGroup,
                    wasteCharacteristics,
                    isReadOnly: result.isReadOnly,
                    groupId: result.groupId,
                });
            });

            // Filter out any null results
            const filteredData = processedData.filter((item) => item !== null);

            return paginationUtils.formatPaginationResult(
                filteredData,
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Data creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating Data: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating Data');
            }
        }
    }

    async getPendingWasteTreatmentGroups(
        limit: number,
        page: number,
        healthcareFacilityId: number,
    ): Promise<{
        data: WasteTreatmentGroupSelectDto[];
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

            const baseSql = `
            SELECT
                wtg.id,
                wtg.group_id AS "groupId"
            FROM waste_treatment_group wtg
            JOIN waste_bag wb ON wb.waste_treatment_group_id = wtg.id
            WHERE wb.healthcare_facility_id = :healthcareFacilityId
            AND is_read_only = 0 AND treatment_status NOT IN ('IN_COLD_STORAGE','IN_TEMPORARY_STORAGE')
            GROUP BY wtg.id
            `;

            const countSql = `
            SELECT COUNT(*) AS total FROM (
                ${baseSql}
            ) AS sub
            `;

            const [countResult] = await sequelize.query(countSql, {
                replacements: { healthcareFacilityId },
                type: QueryTypes.SELECT,
            });

            const dataSql = `
            ${baseSql}
            ORDER BY MAX(wb.updated_at) DESC
            LIMIT :limit OFFSET :offset
            `;

            const rows = await sequelize.query(dataSql, {
                replacements: {
                    healthcareFacilityId,
                    limit: safeLimit,
                    offset: (safePage - 1) * safeLimit,
                },
                type: QueryTypes.SELECT,
            });

            const mapped = (rows as any[]).map((result) => {
                return new WasteTreatmentGroupSelectDto({
                    id: result.id,
                    groupId: result.groupId,
                });
            });

            return paginationUtils.formatPaginationResult(
                mapped,
                Number((countResult as any).total),
                safeLimit,
                safePage,
            );
        } catch (error) {
            throw error;
        }
    }

    async updateIsReadOnly(wasteGroupIds: string) {
        await sequelize.transaction(async (t: Transaction) => {
            await sequelize.query(
                `UPDATE waste_treatment_group
                            SET is_read_only = 1
                            WHERE FIND_IN_SET(id, :csv) > 0`,
                { replacements: { csv: wasteGroupIds }, transaction: t },
            );
        });
    }
}
