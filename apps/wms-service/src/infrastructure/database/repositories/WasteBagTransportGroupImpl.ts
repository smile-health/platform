import { Op, UniqueConstraintError } from 'sequelize';
import WasteTransportationGroupModel from '../models/WasteTransportationGroupModel';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';
import WasteTransportationGroup from '../../../domain/entities/WasteTransportationGroup';
import { WasteTransportationGroupAttributes } from '../models/WasteTransportationGroupModel';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';
import InfraRegistry from '../../../infrastructure/database/repositories/infraRegistry';
import { getTotalWeightFromWasteBags } from '../../../shared/utils/wasteMiscellaneous';
import WasteBagModel from '../models/WasteBagModel';
import { WasteBagAuditTrailModel } from '../models/WasteBagAuditTrailModel';
import { WasteBagModelAttributes } from '../../../infrastructure/database/models/WasteBagModel';
import generateWasteGroupId from '../../../shared/utils/generateWasteGroupId';
import WasteClassificationModel from '../../../infrastructure/database/models/WasteClassificationModel';
import WasteHierarchyModel from '../../../infrastructure/database/models/WasteHierarchyModel';
import { PartnerVehicleModel } from '../models/PartnerVehicleModel';

export default class WasteBagTransportGroupImpl implements WasteTransportationGroupRepository {
    async createWasteTransportationGroup(
        wasteBagIds: string[],
        payload: WasteTransportationGroup,
        entityId: number,
        providerType: string,
    ): Promise<WasteTransportationGroup | null> {
        try {
            const wasteBags =
                await InfraRegistry.wasteBagRepositoryImpl!.getWasteBagsByIds(wasteBagIds);

            if (!wasteBags?.length) {
                throw new Error('Waste bag not found for the given ids');
            }

            let status: 'TRANSPORTER_LANDFILL' | 'TRANSPORTER_RECYCLER' | 'TRANSPORTER_TREATMENT' | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        | 'SPECIALIZED_TREATMENT_PROVIDER';

            // const parse = classification?.disposalMethod
            switch (providerType) {
                case 'TRANSPORTER_LANDFILL':
                    status = 'TRANSPORTER_LANDFILL';
                    break;
                case 'TRANSPORTER_RECYCLER':
                    status = 'TRANSPORTER_RECYCLER';
                    break;
                case 'SPECIALIZED_TREATMENT_PROVIDER':
                    status = 'SPECIALIZED_TREATMENT_PROVIDER';
                    break;
                case 'TRANSPORTER_GOVERNMENT':
                    status = 'TRANSPORTER_GOVERNMENT';
                    break;
                case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
                    status = 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
                    break;
                default:
                    status = 'TRANSPORTER_TREATMENT';
                    break;
            }

            const groupId = generateWasteGroupId(wasteBagIds, status);

            const createModelObj: WasteTransportationGroupAttributes = {
                createdBy: payload.createdBy,
                updatedBy: payload.createdBy,
                totalBagsCount: wasteBags.length,
                totalWeightInKgs: Number(
                    parseFloat(getTotalWeightFromWasteBags(wasteBags).toString()),
                ),
                transporterVehicleId: payload.transporterVehicleId,
                transporterOperatorId: payload.transporterOperatorId,
                handoverLattitude: payload.handoverLattitude,
                handoverLongitude: payload.handoverLongitude,
                transportationStatus: 'READY_FOR_TRANSPORT',
                handoverTimestamp: payload.handoverTimestamp,
                groupId: groupId,
            };
            console.log('createModelObj:', createModelObj);
            const created = await WasteTransportationGroupModel.create(createModelObj);
            console.log('Waste Transportation Group Group created successfully');

            const result = created.get({ plain: true });

            if (!created.id) {
                throw new Error(
                    'Failed to retrieve ID from newly created WasteTransportationGroup.',
                );
            }

            return new WasteTransportationGroup({
                id: created.id ?? result.id,
                createdBy: result.createdBy as string,
                updatedBy: result.updatedBy,
                createdAt: result.created_at as Date,
                updatedAt: result.updated_at,
                totalBagsCount: result.totalBagsCount,
                totalWeightInKgs: result.totalWeightInKgs,
                transporterVehicleId: result.transporterVehicleId,
                transporterOperatorId: result.transporterOperatorId,
                handoverLattitude: result.handoverLattitude,
                handoverLongitude: result.handoverLongitude,
                transportationStatus: result.transportationStatus,
                handoverTimestamp: result.handoverTimestamp,
            });
        } catch (error) {
            console.error('Error creating Waste Transportation Group Group:', error);
            throw new Error('Error creating Waste Transportation Group Group');
        }
    }

    async createWasteTransportationGroupFromBags(
        wasteBags: WasteBagModel[],
        wasteBagIds: string[],
        payload: WasteTransportationGroup,
        entityId: number,
        providerType: string,
    ): Promise<WasteTransportationGroup | null> {
        try {
            if (!wasteBags?.length) {
                throw new Error('Waste bag not found for the given ids');
            }

            let status: 'TRANSPORTER_LANDFILL' | 'TRANSPORTER_RECYCLER' | 'TRANSPORTER_TREATMENT' | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
        | 'SPECIALIZED_TREATMENT_PROVIDER';

            switch (providerType) {
                case 'TRANSPORTER_LANDFILL':
                    status = 'TRANSPORTER_LANDFILL';
                    break;
                case 'TRANSPORTER_RECYCLER':
                    status = 'TRANSPORTER_RECYCLER';
                    break;
                case 'SPECIALIZED_TREATMENT_PROVIDER':
                    status = 'SPECIALIZED_TREATMENT_PROVIDER';
                    break;
                case 'TRANSPORTER_GOVERNMENT':
                    status = 'TRANSPORTER_GOVERNMENT';
                    break;
                case 'TRANSPORTER_GOVERNMENT_WASTE_BANK':
                    status = 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
                    break;
                default:
                    status = 'TRANSPORTER_TREATMENT';
                    break;
            }

            const groupId = generateWasteGroupId(wasteBagIds, status);

            const createModelObj: WasteTransportationGroupAttributes = {
                createdBy: payload.createdBy,
                updatedBy: payload.createdBy,
                totalBagsCount: wasteBags.length,
                totalWeightInKgs: Number(
                    parseFloat(getTotalWeightFromWasteBags(wasteBags).toString()),
                ),
                transporterVehicleId: payload.transporterVehicleId,
                transporterOperatorId: payload.transporterOperatorId,
                handoverLattitude: payload.handoverLattitude,
                handoverLongitude: payload.handoverLongitude,
                transportationStatus: 'READY_FOR_TRANSPORT',
                handoverTimestamp: payload.handoverTimestamp,
                groupId: groupId,
            };
            const created = await WasteTransportationGroupModel.create(createModelObj);

            const result = created.get({ plain: true });

            if (!created.id) {
                throw new Error(
                    'Failed to retrieve ID from newly created WasteTransportationGroup.',
                );
            }

            return new WasteTransportationGroup({
                id: created.id ?? result.id,
                createdBy: result.createdBy as string,
                updatedBy: result.updatedBy,
                createdAt: result.created_at as Date,
                updatedAt: result.updated_at,
                totalBagsCount: result.totalBagsCount,
                totalWeightInKgs: result.totalWeightInKgs,
                transporterVehicleId: result.transporterVehicleId,
                transporterOperatorId: result.transporterOperatorId,
                handoverLattitude: result.handoverLattitude,
                handoverLongitude: result.handoverLongitude,
                transportationStatus: result.transportationStatus,
                handoverTimestamp: result.handoverTimestamp,
            });
        } catch (error) {
            console.error('Error creating Waste Transportation Group Group:', error);
            throw new Error('Error creating Waste Transportation Group Group');
        }
    }

    async getWasteTransportationGroupById(
        token: string,
        id?: string,
        qrCodeId?: string,
    ): Promise<WasteTransportationGroup | null> {
        try {
            const existingData = await WasteTransportationGroupModel.findOne({
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
                        include: [
                            {
                                model: WasteBagAuditTrailModel,
                                as: 'logHistory',
                            },
                        ],
                    },
                ],
            });

            if (!existingData) {
                console.error(`Waste Transportation Group Group with ID ${id} not found`);
                return null;
            }

            const result = await existingData.get({ plain: true });

            const firstBag = result.wasteBags;

            const wasteClassification = await WasteClassificationModel.findOne({
                where: {
                    id: firstBag[0].wasteClassificationId,
                },
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

            const partnership =
                await InfraRegistry.partnershipRepositoryImpl?.getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId(
                    token,
                    firstBag[0].healthcareFacilityId,
                    firstBag[0].wasteClassificationId,
                );

            const vehicleData = await PartnerVehicleModel.findByPk(
                firstBag[0].transporterVehicleId,
            );

            const distinctWasteClassificationIds = [
                ...new Set(result.wasteBags.map((bag: any) => bag.wasteClassificationId as number)),
            ] as number[];
            const classificationsForTreatmentMethod = await WasteClassificationModel.findAll({
                where: { id: { [Op.in]: distinctWasteClassificationIds } },
                attributes: ['id', 'treatmentMethod'],
            });
            const treatmentMethodMap = new Map(
                classificationsForTreatmentMethod.map((c) => [
                    c.dataValues.id,
                    c.dataValues.treatmentMethod,
                ]),
            );

            const wasteBagPromises = result.wasteBags.map(
                async (bag: WasteBagModelAttributes | any) => {
                    const manifestDocPath = bag.manifestDocPath
                        ? await InfraRegistry.s3FileServiceRepositoryImpl!.getPresignedUrl(
                              bag.manifestDocPath,
                          )
                        : bag.manifestDocPath;

                    return {
                        ...bag,
                        manifestDocPath: manifestDocPath,
                        treatmentMethod: treatmentMethodMap.get(bag.wasteClassificationId),
                    };
                },
            );

            const wasteBags = await Promise.all(wasteBagPromises);

            return new WasteTransportationGroup({
                id: result.id,
                createdBy: result.createdBy as string,
                updatedBy: result.updatedBy,
                createdAt: result.created_at,
                updatedAt: result.updated_at,
                totalBagsCount: result.totalBagsCount,
                totalWeightInKgs: result.totalWeightInKgs,
                transporterVehicleId: result.transporterVehicleId,
                transporterOperatorId: result.transporterOperatorId,
                handoverLattitude: result.handoverLattitude,
                handoverLongitude: result.handoverLongitude,
                transportationStatus: result.transportationStatus,
                handoverTimestamp: result.handoverTimestamp,
                isReadOnly: result.isReadOnly,
                groupId: result.groupId,
                wasteBags: wasteBags,
                wasteClassification: wasteClassification,
                partnership: partnership,
                vehicle: vehicleData,
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getAllWasteTransportationGroups(
        limit: number,
        page: number,
        entityId?: number,
        date?: Date,
        status?:
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
        data: WasteTransportationGroup[];
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

            const { count, rows } = await WasteTransportationGroupModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['updated_at', 'DESC']],
                distinct: true,
                where: {
                    ...(date && {
                        created_at: {
                            [Op.gte]: new Date(date),
                            [Op.lt]: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
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

            const processedData = await Promise.all(
                rows.map(async (data: WasteTransportationGroupModel) => {
                    const result = data.get({ plain: true });

                    // Get the first waste bag from this group
                    const firstBag = result.wasteBags[0];

                    if (!firstBag) {
                        return null;
                    }

                    const classificationWaste = await WasteClassificationModel.findByPk(
                        firstBag.wasteClassificationId,
                        {
                            include: [
                                {
                                    model: WasteHierarchyModel,
                                    as: 'wasteType',
                                    required: true,
                                    attributes: [
                                        'id',
                                        'name',
                                        'description',
                                        'nameEn',
                                        'descriptionEn',
                                    ],
                                },
                                {
                                    model: WasteHierarchyModel,
                                    as: 'wasteGroup',
                                    required: true,
                                    attributes: [
                                        'id',
                                        'name',
                                        'description',
                                        'nameEn',
                                        'descriptionEn',
                                    ],
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
                        },
                    );

                    return new WasteTransportationGroup({
                        id: result.id,
                        createdBy: result.createdBy as string,
                        updatedBy: result.updatedBy,
                        createdAt: result.created_at,
                        updatedAt: result.updated_at,
                        totalBagsCount: result.totalBagsCount,
                        totalWeightInKgs: result.totalWeightInKgs,
                        transporterVehicleId: result.transporterVehicleId,
                        transporterOperatorId: result.transporterOperatorId,
                        handoverLattitude: result.handoverLattitude,
                        handoverLongitude: result.handoverLongitude,
                        transportationStatus: result.transportationStatus,
                        handoverTimestamp: result.handoverTimestamp,
                        isReadOnly: result.isReadOnly,
                        groupId: result.groupId,
                        wasteBags: result.wasteBags.map((bag: any) => ({
                            ...bag,
                            qr_code: bag.wasteBagQrCodeId,
                        })),
                        wasteClassification: classificationWaste,
                    });
                }),
            );

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
                throw new Error(`Data failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating Data: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating Data');
            }
        }
    }

    async updateWasteTransportationGroup(
        wasteTransportationGroup: WasteTransportationGroup,
    ): Promise<void | null> {
        try {
            if (!wasteTransportationGroup.id || !wasteTransportationGroup.updatedBy) {
                throw new Error('Missing required fields for WasteTransportationGroup update');
            }

            const existingData = (await checkExistingData(
                WasteTransportationGroupModel,
                wasteTransportationGroup.id,
            )) as any;

            if (!existingData) {
                console.error(
                    `Waste Transportation Group Group with ID ${wasteTransportationGroup.id} not found`,
                );
                return null;
            }

            const updateModelObj = {
                updatedBy: wasteTransportationGroup.updatedBy,
                updatedAt: new Date(),
                transporterVehicleId: wasteTransportationGroup.transporterVehicleId,
                transporterOperatorId: wasteTransportationGroup.transporterOperatorId,
                handoverLattitude: wasteTransportationGroup.handoverLattitude,
                totalWeightInKgs:
                    existingData.get('totalWeightInKgs') ?? existingData.totalWeightInKgs,
                handoverLongitude: wasteTransportationGroup.handoverLongitude,
                transportationStatus: wasteTransportationGroup.transportationStatus,
                handoverTimestamp: wasteTransportationGroup.handoverTimestamp,
            };

            await existingData.update(updateModelObj);
            console.log('Waste Transportation Group Group updated successfully');
        } catch (error) {
            console.error('Error updating Waste Transportation Group Group:', error);
            throw new Error('Error updating Waste Transportation Group Group');
        }
    }

    async deleteWasteTransportationGroup(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            const existingData = (await checkExistingData(
                WasteTransportationGroupModel,
                id,
            )) as any;

            if (!existingData) {
                console.error(`Waste Transportation Group Group with ID ${id} not found`);
                return null;
            }

            if (deletedBy) await WasteTransportationGroupModel.update({ deletedBy }, { where: { id } });
            await WasteTransportationGroupModel.destroy({
                where: { id },
            });
            console.log('Waste Transportation Group Group deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Waste Transportation Group Group:', error);
            throw new Error('Error deleting Waste Transportation Group Group');
        }
    }

    async getWasteBagTransportGroupById(id: number): Promise<WasteTransportationGroup | null> {
        try {
            const wasteBagTransportGroup = await WasteTransportationGroupModel.findByPk(id);

            if (!wasteBagTransportGroup) {
                console.error(`Waste Bag Transport Group with ID ${id} not found`);
                return null;
            }
            // return wasteBagTransportGroup;
            return new WasteTransportationGroup({
                id: wasteBagTransportGroup.get('id') as number | undefined,
                createdBy: wasteBagTransportGroup.createdBy as string,
                updatedBy: wasteBagTransportGroup.updatedBy,
                createdAt: wasteBagTransportGroup.created_at as Date,
                updatedAt: wasteBagTransportGroup.updated_at as Date,
                totalBagsCount: wasteBagTransportGroup.totalBagsCount,
                totalWeightInKgs: wasteBagTransportGroup.totalWeightInKgs,
                transporterVehicleId: wasteBagTransportGroup.transporterVehicleId,
                transporterOperatorId: wasteBagTransportGroup.transporterOperatorId,
                handoverLattitude: wasteBagTransportGroup.handoverLattitude,
                handoverLongitude: wasteBagTransportGroup.handoverLongitude,
                transportationStatus: wasteBagTransportGroup.transportationStatus,
                handoverTimestamp: wasteBagTransportGroup.handoverTimestamp,
                isReadOnly: wasteBagTransportGroup.isReadOnly,
                groupId: wasteBagTransportGroup.groupId,
            });
        } catch (error) {
            console.error('Error fetching WasteBagTransportGroup by ID:', error);
            throw new Error('Database error');
        }
    }

    async getWasteBagTransportGroupByIds(ids: number[]): Promise<WasteTransportationGroup[]> {
        try {
            const wasteBagTransportGroups = await WasteTransportationGroupModel.findAll({
                where: {
                    id: {
                        [Op.in]: ids,
                    },
                },
            });

            return wasteBagTransportGroups.map((m: any) => {
                return new WasteTransportationGroup({
                    id: m.get('id') as number | undefined,
                    createdBy: m.createdBy,
                    updatedBy: m.updatedBy,
                    createdAt: m.createdAt,
                    updatedAt: m.updatedAt,
                    totalBagsCount: m.totalBagsCount,
                    totalWeightInKgs: m.totalWeightInKgs,
                    transporterVehicleId: m.transporterVehicleId,
                    transporterOperatorId: m.transporterOperatorId,
                    handoverLattitude: m.handoverLattitude,
                    handoverLongitude: m.handoverLongitude,
                    transportationStatus: m.transportationStatus,
                    handoverTimestamp: m.handoverTimestamp,
                    isReadOnly: m.isReadOnly,
                    groupId: m.groupId,
                });
            });
        } catch (error) {
            console.error('Error fetching WasteBagTransportGroup by ID:', error);
            throw new Error('Database error');
        }
    }
}
