import PartnershipOperatorMap, {
    OperatorsSelectDTO,
} from '../../../domain/entities/PartnershipOperatorMap';
import {
    PartnershipOperatorMapModel,
    PartnershipOperatorMapAttributes,
} from '../models/PartnershipOperatorMapModel';
import PartnershipOperatorMapRepository from '../../../domain/repositories/PartnershipOperatorMapRepository';
import { paginationUtils } from '../../../shared/utils/pagination';
import PartnershipModel from '../models/PartnershipModel';
import { PartnershipAttributes } from '../models/PartnershipModel';
import { getEntityDetail, getUsersDetail } from '../../external-apis/thirdPartyClient';
import { checkExistingDataWithColumns } from '../../../shared/utils/checkExistingData';
import { QueryTypes, WhereOptions } from 'sequelize';
import { sequelize } from '../db.connection';

export default class PartnershipOperatorMapRepositoryImpl
    implements PartnershipOperatorMapRepository
{
    async createPartnershipOperatorMap(
        partnershipOperatorMap: PartnershipOperatorMap,
    ): Promise<void> {
        try {
            if (!partnershipOperatorMap.operatorId || !partnershipOperatorMap.partnershipId) {
                throw new Error('Missing required fields for PartnershipOperatorMap');
            }
            const createModelObj: PartnershipOperatorMapAttributes = {
                partnership_id: partnershipOperatorMap.partnershipId,
                operator_id: partnershipOperatorMap.operatorId,
            };
            console.log('createModelObj:', createModelObj);
            await PartnershipOperatorMapModel.create(createModelObj);
            console.log('Partnership OperatorMap created successfully');
        } catch (error) {
            console.error('Error creating Partnership OperatorMap:', error);
            throw new Error('Error creating Partnership OperatorMap');
        }
    }

    async getAllPartnershipOperatorMaps(
        limit: number,
        page: number,
        token: string,
        providerId: number,
        search: string | undefined = undefined,
        partnershipId?: number,
    ): Promise<{
        data: PartnershipOperatorMap[];
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
            FROM partnership_operator_map pom
            WHERE pom.partnership_id IN (
                SELECT p.id
                FROM partnership p
                WHERE p.provider_id = :providerId
                AND p.consumer_id = :healthcareFacilityId
                AND p.transporter_id IS NULL
            )
        `;

            // Query data (pakai limit & offset)
            const dataSql = `
            SELECT pom.operator_id, pom.partnership_id
            ${baseSql}
            LIMIT :limit OFFSET :offset
        `;

            // Query total count
            const countSql = `
            SELECT COUNT(*) AS total
            ${baseSql}
        `;

            const replacements = {
                providerId,
                healthcareFacilityId: Number(search),
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
            };

            const [partnershipOperatorMap, countResult] = await Promise.all([
                sequelize.query(dataSql, {
                    replacements,
                    type: QueryTypes.SELECT,
                }),
                sequelize.query(countSql, {
                    replacements,
                    type: QueryTypes.SELECT,
                }),
            ]);

            const total = Number((countResult[0] as any).total);

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    partnershipOperatorMap.map(async (m: any) => {
                        const dataUsers = await getUsersDetail(m.operator_id.toString(), token);
                        const userRole = Array.isArray(dataUsers?.external_roles)
                            ? dataUsers.external_roles[0]
                            : dataUsers?.external_roles;
                        return new PartnershipOperatorMap({
                            partnershipId: m.partnership_id,
                            operatorId: m.operator_id,
                            userName: dataUsers?.username,
                            firstName: dataUsers?.firstname,
                            lastName: dataUsers?.lastname,
                            entityName: dataUsers?.entity?.name,
                            entityType: dataUsers?.entity_type?.name,
                            email: dataUsers?.email,
                            mobilePhone: dataUsers?.mobile_phone,
                            userRole: userRole,
                        });
                    }),
                ),
                total,
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving Partnership OperatorMaps:', error);
            throw new Error('Error retrieving Partnership OperatorMaps');
        }
    }

    async updatePartnershipOperatorMap(
        partnershipOperatorMap: PartnershipOperatorMap,
        partnership_id: number,
        operator_id: string,
    ): Promise<void | null> {
        try {
            if (!partnershipOperatorMap.operatorId || !partnershipOperatorMap.partnershipId) {
                throw new Error('Missing required fields for PartnershipOperatorMap update');
            }

            const existingData = await PartnershipOperatorMapModel.findOne({
                where: {
                    partnership_id: partnership_id,
                    operator_id: operator_id,
                },
            });

            if (!existingData) {
                console.error(
                    `Partnership OperatorMap with operatorId ${partnershipOperatorMap.operatorId} not found`,
                );
                return null;
            }

            const updateModelObj = {
                partnership_id: partnershipOperatorMap.partnershipId,
                operator_id: partnershipOperatorMap.operatorId,
            };

            await PartnershipOperatorMapModel.update(updateModelObj, {
                where: {
                    partnership_id: partnership_id,
                    operator_id: operator_id,
                },
            });
            console.log('Partnership OperatorMap updated successfully');
        } catch (error) {
            console.error('Error updating Partnership OperatorMap:', error);
            throw new Error('Error updating Partnership OperatorMap');
        }
    }

    async deletePartnershipOperatorMap(
        partnershipId: number,
        operatorId: string,
        deletedBy?: number,
    ): Promise<boolean | null> {
        try {
            const existingData = await PartnershipOperatorMapModel.findOne({
                where: {
                    partnership_id: partnershipId,
                    operator_id: operatorId,
                },
            });

            if (!existingData) {
                console.error(
                    `Partnership OperatorMap with operatorId ${partnershipId} and operatorId ${operatorId} not found`,
                );
                return null;
            }

            if (deletedBy) await existingData.update({ deletedBy });
            await existingData.destroy();
            console.log('Partnership OperatorMap deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting Partnership OperatorMap:', error);
            throw new Error('Error deleting Partnership OperatorMap');
        }
    }

    async getAllPartnershipOperatorMapsByThirdpartyAdmin(
        limit: number,
        page: number,
        token: string,
        search: string | undefined = undefined,
        operatorId?: string,
    ): Promise<{
        data: PartnershipOperatorMap[];
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

            const { count, rows } = await PartnershipOperatorMapModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['partnership_id', 'ASC']],
                // distinct: true,
                where: {
                    ...(operatorId && {
                        operator_id: operatorId,
                    }),
                },
                include: [
                    {
                        model: PartnershipModel,
                        as: 'partnership',
                        attributes: ['id', 'providerId', 'consumerId'],
                        where: {
                            ...(search && {
                                provider_id: Number(search),
                            }),
                        },
                        required: true,
                    },
                ],
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (m: any) => {
                        const externalData = m.get('partnership') as PartnershipAttributes | null;
                        //get information entity
                        let entityName = '-';
                        if (externalData) {
                            const dataEntity = await getEntityDetail(
                                externalData?.consumerId,
                                token,
                            );
                            entityName = dataEntity?.name;
                        }

                        const dataUser: any = await getUsersDetail(m.get('operator_id'), token);

                        const fullName = [dataUser?.firstname, dataUser?.lastname]
                            .filter(Boolean)
                            .join(' ')

                        return new PartnershipOperatorMap({
                            partnershipId: m.get('partnership_id'),
                            operatorId: m.get('operator_id'),
                            consumerName: entityName,
                            operatorName: fullName,
                        });
                    }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving Partnership OperatorMaps:', error);
            throw new Error('Error retrieving Partnership OperatorMaps');
        }
    }

    async findPartnershipOperatorMapByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<PartnershipOperatorMap | null> {
        const data: any = await checkExistingDataWithColumns(
            PartnershipOperatorMapModel,
            whereClause,
        );

        if (!data) {
            return null;
        }

        return new PartnershipOperatorMap({
            partnershipId: data.partnership_id,
            operatorId: data.operator_id,
        });
    }

    async getOperatorsFromOperatorMap(
        token: string,
        entityId: number,
    ): Promise<OperatorsSelectDTO[]> {
        try {
            const data: any = await PartnershipOperatorMapModel.findAll({
                order: [['partnership_id', 'ASC']],
                attributes: ['operator_id', 'partnership_id'],
                include: [
                    {
                        model: PartnershipModel,
                        as: 'partnership',
                        attributes: ['id', 'providerId', 'consumerId'],
                        where: {
                            provider_id: entityId,
                        },
                        required: true,
                    },
                ],
                group: ['operator_id'],
            });
            const dataOperator = await Promise.all(
                data.map(async (item: any) => {
                    //get information entity
                    const dataUser = await getUsersDetail(
                        item.dataValues.operator_id.toString(),
                        token,
                    );

                    const fullName = [dataUser?.firstname, dataUser?.lastname]
                        .filter(Boolean)
                        .join(' ')

                    return new OperatorsSelectDTO({
                        operatorId: item.dataValues.operator_id,
                        operatorName: fullName,
                    });
                }),
            );

            console.log('partnership retrieved successfully:', dataOperator);
            return dataOperator;
        } catch (error) {
            console.error('Error retrieving partnership:', error);
            throw new Error('Error retrieving partnership');
        }
    }
}
