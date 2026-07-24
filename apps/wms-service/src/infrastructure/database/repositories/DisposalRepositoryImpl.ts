import { QueryTypes, UniqueConstraintError } from 'sequelize';
import Disposal from '../../../domain/entities/Disposal';
import DisposalRepository from '../../../domain/repositories/DisposalRepository';
import DisposalModel, { DisposalAttributes } from '../models/DisposalModel';
import { BastBody } from '../../../shared/types/bastType';
import DisposalItemsModel from '../models/DisposalItemsModel';
import { getUsersDetail, rejectedDisposalBast } from '../../external-apis/thirdPartyClient';
import { paginationUtils } from '../../../shared/utils/pagination';
import { Op } from 'sequelize';
import { getLogHistories, WASTE_STATUS, WASTE_STATUS_ID } from '../../../shared/utils/logHistories';
import { DisposalItemsSmile } from '../../../domain/entities/DisposalItems';
import { sequelize } from '../db.connection';

export default class DisposalRepositoryImpl implements DisposalRepository {
    async createDisposal(model: BastBody): Promise<{ bast_no: string } | null | string> {
        try {
            if (!model.bast_no || !model.sender.entity_id || !model.user_created_by.user_uuid)
                return null;

            if (model.disposal_items.length === 0) return 'Material not found';

            const createObject: DisposalAttributes = {
                bastNo: model.bast_no,
                description: model.disposal_comments,
                createdBy: model.user_created_by.user_uuid,
                createdName: model.user_created_by.username,
                entityId: model.sender.entity_id,
                entityName: model.sender.entity_name,
                status: 'PENDING',
                isRead: false,
                // approvedBy: model.approvedBy,
                // rejectedBy: model.rejectedBy,
                // rejectedReason: model.rejectedReason,
                // approvedAt: model.approvedAt,
                // rejectedAt: model.rejectedAt,
            };

            const process = await DisposalModel.create(createObject);

            const result = process.get({ plain: true });

            if (!result.bastNo) return 'Disposal created failed';

            Promise.all([
                model.disposal_items.map(async (value) => {
                    await DisposalItemsModel.create({
                        materialId: value.material_id,
                        bastNo: result.bastNo,
                        materialName: value.material_name,
                        qty: value.qty,
                    });
                }),
            ]);

            return {
                bast_no: result.bastNo,
            };
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Create error: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Create error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while creating Disposal data');
            }
        }
    }

    async approvalDisposal(
        bastNo: string,
        status: 'APPROVED' | 'REJECTED',
        userUuid: string,
        token: string,
        reason?: string,
    ): Promise<boolean> {
        try {
            if (status === 'APPROVED') {
                let tes = await DisposalModel.update(
                    {
                        approvedBy: userUuid,
                        approvedAt: new Date(),
                        status: 'APPROVED',
                    },
                    {
                        where: {
                            bastNo: bastNo,
                            status: 'PENDING'
                        },
                    },
                );
                return true;
            } else {
                await DisposalModel.update(
                    {
                        rejectedBy: userUuid,
                        rejectedReason: reason,
                        rejectedAt: new Date(),
                        status: 'REJECTED',
                    },
                    {
                        where: {
                            bastNo: bastNo,
                            status: 'PENDING',
                        },
                    },
                );

                await rejectedDisposalBast(token, bastNo, reason ?? '');
                return true;
            }
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Update error: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Update error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred while updating Disposal data');
            }
        }
    }

    async getAlldisposalByEntityId(
        limit: number,
        page: number,
        entityId: number | undefined,
        search?: string,
        status?: string,
        isRead?: boolean,
    ): Promise<{
        data: any[];
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

            const { count, rows } = await DisposalModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['createdAt', 'ASC']],
                where: {
                    ...(search && {
                        [Op.or]: [
                            { bastNo: { [Op.like]: `%${search}%` } },
                            { entityName: { [Op.like]: `%${search}%` } },
                        ],
                    }),
                    ...(entityId && {
                        entityId: entityId,
                    }),
                    ...(status && {
                        status: status,
                    }),
                    ...(isRead !== undefined ? { isRead: isRead } : {}),
                },
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (m: any) => {
                        const result = createObjectData(m);
                        const disposalItems: any[] = await DisposalItemsModel.findAll({
                            where: { bastNo: result.bastNo },
                            attributes: ['id', 'materialId', 'bastNo', 'materialName', 'qty'],
                            raw: true,
                        });
                        return {
                            ...result,
                            disposalItems,
                        };
                    }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving disposal:', error);
            throw new Error('Error retrieving disposal');
        }
    }

    async getDisposal(bastNo: string, token: string) {
        try {
            const disposal = await DisposalModel.findOne({
                where: { bastNo },
            });

            if (!disposal) {
                throw new Error('NOT_FOUND');
            }

            const dataDisposal = createObjectData(disposal);

            const rows: any[] = await DisposalItemsModel.findAll({
                where: { bastNo },
                attributes: ['id', 'materialId', 'bastNo', 'materialName', 'qty'],
                raw: true,
            });

            const dataDisposalItems = await Promise.all(
                rows.map(async (data: any) => {
                    // Query untuk wasteBag
                    const query = `
                    SELECT
                        wb.id,
                        wb.waste_bag_qr_code_id,
                        wb.weight_in_kgs,
                        wt.name wasteTypeName,
                        wg.name wasteGroupName,
                        wch.name wasteCharacteristicName
                    FROM waste_bag wb
                    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                    JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
                    JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
                    JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
                    JOIN disposal_items di
                        ON FIND_IN_SET(di.material_id, wb.material_ids) > 0
                    WHERE di.material_id = :materialId AND wb.bast_no = :bastNo
                `;

                    const wasteBag = await sequelize.query<any>(query, {
                        replacements: { bastNo:bastNo, materialId: data.materialId },
                        type: QueryTypes.SELECT,
                        plain: true,
                    });

                    // Default wasteInfo = null
                    let wasteInfo: any = null;

                    if (wasteBag) {
                        // Ambil histories hanya kalau ada wasteBag.id
                        const rawHistories = wasteBag?.id ? await getLogHistories(wasteBag.id) : [];

                        // Mapping enum status
                        const EN_VAL2KEY = Object.fromEntries(
                            Object.entries(WASTE_STATUS).map(([k, v]) => [String(v), k]),
                        );
                        const ID_VAL2KEY = Object.fromEntries(
                            Object.entries(WASTE_STATUS_ID).map(([k, v]) => [String(v), k]),
                        );

                        const histories = Array.isArray(rawHistories)
                            ? rawHistories.map((h: any) => {
                                  const raw = h?.wasteStatus ?? 'UNKNOWN';
                                  let key: string | undefined;

                                  if ((WASTE_STATUS as any)[raw] !== undefined) key = raw;
                                  else if (EN_VAL2KEY[raw]) key = EN_VAL2KEY[raw];
                                  else if ((WASTE_STATUS_ID as any)[raw] !== undefined) key = raw;
                                  else if (ID_VAL2KEY[raw]) key = ID_VAL2KEY[raw];

                                  const status_label_en =
                                      key && (WASTE_STATUS as any)[key] !== undefined
                                          ? (WASTE_STATUS as any)[key]
                                          : raw;

                                  const status_label_id =
                                      key && (WASTE_STATUS_ID as any)[key] !== undefined
                                          ? (WASTE_STATUS_ID as any)[key]
                                          : raw;

                                  return {
                                      status: raw,
                                      status_label_id,
                                      status_label_en,
                                      updated_at: h?.wasteBagStatusUpdateDate ?? null,
                                  };
                              })
                            : [];

                        // Waste Info
                        wasteInfo = {
                            waste_bag_codes: wasteBag?.waste_bag_qr_code_id,
                            waste_bag_total_weight: wasteBag?.weight_in_kgs,
                            waste_bag_type_label: wasteBag?.wasteTypeName,
                            waste_bag_group_label: wasteBag?.wasteGroupName,
                            waste_bag_characteristics_label: wasteBag?.wasteCharacteristicName,
                            waste_bag_histories: histories,
                        };
                    }

                    // DTO DisposalItem
                    const dto = new DisposalItemsSmile({
                        id: data.id,
                        material_id: data.materialId,
                        name: data.materialName,
                        qty: Number(data.qty),
                    });

                    return {
                        ...dto,
                        waste_info: wasteInfo, // bisa null
                    };
                }),
            );

            // Get user detail dari SMILE
            const dataUser = await getUsersDetail(dataDisposal.approvedBy, token);

            const fullName = [dataUser?.firstname, dataUser?.lastname]
                .filter(Boolean)
                .join(' ')
            // Final Response
            const data = {
                bast_no: dataDisposal.bastNo,
                receiver: {
                    name: fullName ?? null,
                    role: Array.isArray(dataUser?.external_roles)
                        ? dataUser?.external_roles[0]
                        : (dataUser?.external_roles ?? null),
                    address: dataUser?.address ?? null,
                    user_uuid: dataDisposal.approvedBy ?? null,
                    entity_name: dataUser?.entity?.name ?? null,
                },
                disposal_items: dataDisposalItems,
            };

            return data;
        } catch (error: any) {
            if (error.message === 'NOT_FOUND') {
                throw new Error('Data not found');
            }
            console.error('Error retrieving bastNo:', error);
            throw new Error('Unexpected error retrieving bastNo');
        }
    }
}

function createObjectData(data: DisposalModel): Disposal {
    const result = data.get({ plain: true });

    return new Disposal({
        id: result.id ?? data.get('id'),
        bastNo: result.bastNo,
        description: result.description,
        createdBy: result.createdBy,
        createdName: result.createdName,
        entityId: result.entityId,
        entityName: result.entityName,
        status: result.status,
        isRead: result.isRead,
        approvedBy: result.approvedBy,
        rejectedBy: result.rejectedBy,
        rejectedReason: result.rejectedReason,
        approvedAt: result.approvedAt,
        rejectedAt: result.rejectedAt,
        createdAt: result.createdAt,
    });
}
