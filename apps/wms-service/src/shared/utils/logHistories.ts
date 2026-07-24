import { QueryTypes } from 'sequelize';
import { WasteBagHistory } from '../../domain/entities/WasteBagTrackingHistory';
import { sequelize } from '../../infrastructure/database/db.connection';
import WasteBagModel from '../../infrastructure/database/models/WasteBagModel';

export async function getLogHistories(
    wasteBagId?: number,
    wasteGroupNumber?: string,
    wasteBagQrCode?: string,
): Promise<WasteBagHistory[]> {
    let resolvedWasteBagId: number | null = null;

    if (wasteBagId) {
        resolvedWasteBagId = wasteBagId;
    } else if (wasteGroupNumber) {
        const findBagSql = `
            SELECT wb.id
            FROM (
                SELECT wtg.id, wtg.group_id, 'IN' AS data_source
                FROM waste_treatment_group wtg
                UNION ALL
                SELECT wteg.id, wteg.group_id, 'EX' AS data_source
                FROM waste_transportation_external_group wteg
            ) a
            JOIN waste_bag wb
                ON (
                    (a.data_source = 'IN' AND wb.waste_treatment_group_id = a.id)
                    OR
                    (a.data_source = 'EX' AND wb.waste_transportation_external_group_id = a.id)
                )
            WHERE a.group_id = :wasteGroupNumber
            LIMIT 1;
        `;
        const bag = await sequelize.query<{ id: number }>(findBagSql, {
            replacements: { wasteGroupNumber },
            type: QueryTypes.SELECT,
            plain: true,
        });
        resolvedWasteBagId = bag?.id ?? null;
    } else if (wasteBagQrCode) {
        const wasteBag = await WasteBagModel.findOne({
            where: {
                wasteBagQrCodeId: wasteBagQrCode,
            },
        });
        resolvedWasteBagId = wasteBag?.dataValues?.id ?? null;
    }

    if (!resolvedWasteBagId) {
        return [];
    }

    const historySql = `
        SELECT
            b.waste_bag_id wasteBagQrCode,
            b.created_at AS "wasteBagStatusUpdateDate",
            b.event AS "wasteAction",
            b.waste_bag_status AS "wasteStatus",
            a.totalWeight,
            a.totalBags,
            a.groupId,
            a.disposal_method disposalMethod
        FROM (
            SELECT
                wb.waste_bag_qr_code_id,
                ifnull(wteg.total_weight_in_kgs,wtg.total_weight_in_kgs) AS totalWeight,
                ifnull(wteg.total_bags_count, wtg.total_bags_count) AS totalBags,
                ifnull(wteg.group_id, wtg.group_id) groupId,
                wc.disposal_method
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            LEFT JOIN waste_transportation_external_group wteg ON wteg.id = wb.waste_transportation_external_group_id
            LEFT JOIN waste_treatment_group wtg ON wtg.id = wb.waste_treatment_group_id
            WHERE wb.id = :wasteBagId
            UNION ALL
            SELECT
                wb.waste_bag_qr_code_id,
                z.totalWeight,
                z.totalBags,
                z.group_id,
                z.disposal_method
            FROM waste_bag wb
            JOIN (
                SELECT
                    a.id,
                    a.totalWeight,
                    a.totalBags,
                    a.group_id,
                    a.disposal_method
                FROM (
                    SELECT
                        wtg.id,
                        sum(wtg.total_weight_in_kgs) AS totalWeight,
                        sum(wtg.total_bags_count) AS totalBags,
                        wtg.group_id,
                        wc.disposal_method
                    FROM waste_bag wb
                    JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                    JOIN waste_treatment_group wtg
                        ON FIND_IN_SET(wtg.id, wb.waste_group_ids) > 0
                    WHERE wb.id = :wasteBagId
                        AND wb.waste_group_ids IS NOT NULL
                ) a
                LEFT JOIN (
                    SELECT
                        DISTINCT a.waste_treatment_group_id,
                        a.waste_bag_qr_code_id,
                        SUM(a.weight_in_kgs) totalWeight,
                        count(a.id) totalBags
                    FROM waste_bag a
                    WHERE waste_treatment_group_id = a.id
                ) sub ON sub.waste_treatment_group_id = a.id
            ) z
            WHERE z.id = wb.waste_treatment_group_id
        ) a
        JOIN waste_bag_audit_trail b
            ON b.waste_bag_id = a.waste_bag_qr_code_id AND b.is_group = 1
        GROUP BY b.waste_bag_status
        ORDER BY b.created_at asc
    `;

    const results = await sequelize.query<WasteBagHistory>(historySql, {
        replacements: { wasteBagId: resolvedWasteBagId },
        type: QueryTypes.SELECT,
    });

    return results;
}

export enum WASTE_STATUS {
    INTERNAL_LANDFILLED = 'Internally Landfilled',
    IN_TEMPORARY_STORAGE = 'In Temporary Storage',
    INCINERATED = 'Incinerated',
    STERILISED = 'Sterilized',
    IN_TRANSIT = 'In Transit',
    READY_FOR_TREATMENT = 'Ready for Treatment',
    RECYCLED = 'Recycled',
    LANDFILLED = 'Landfilled',
    COLLECTED = 'Collected',
    DISPOSED = 'Disposed',
}

export enum WASTE_STATUS_ID {
    INTERNAL_LANDFILLED = 'Penimbun Internal',
    IN_TEMPORARY_STORAGE = 'Tersimpan',
    INCINERATED = 'Diolah Insinerator Internal',
    STERILISED = 'Diolah Autoklaf Internal',
    IN_TRANSIT = 'Diangkut',
    READY_FOR_TREATMENT = 'Diterima Pengolah',
    RECYCLED = 'Didaur Ulang',
    LANDFILLED = 'Ditimbun',
    COLLECTED = 'Pengangkut Kusus',
    DISPOSED = 'Pembuangan Sampah',
}
