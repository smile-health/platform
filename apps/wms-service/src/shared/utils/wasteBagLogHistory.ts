import { QueryTypes } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db.connection';

export interface WasteBagLogHistoryEntry {
  wasteStatus: string;
  wasteBagStatusUpdateDate: string;
}

/**
 * Fetch log history for a single waste bag.
 *
 * Optimizations vs getLogHistories():
 * - Single input (wasteBagId only) — no 3-param overload or multi-step ID resolution
 * - Query reduced from 6+ tables with UNION ALL + subqueries to a direct 2-table JOIN
 * - SELECT only the 2 columns needed instead of 8
 * - No ORM fallback (WasteBagModel.findOne) — pure raw SQL
 * - Typed return: WasteBagLogHistoryEntry[] instead of WasteBagHistory[]
 */
export async function getWasteBagLogHistory(
  wasteBagId: number,
): Promise<WasteBagLogHistoryEntry[]> {
  if (!wasteBagId) return [];

  const results = await sequelize.query<WasteBagLogHistoryEntry>(
    `SELECT
      bat.waste_bag_status AS wasteStatus,
      bat.created_at      AS wasteBagStatusUpdateDate
    FROM waste_bag wb
    JOIN waste_bag_audit_trail bat
      ON bat.waste_bag_id = wb.waste_bag_qr_code_id
      AND bat.is_group = 1
    WHERE wb.id = :wasteBagId
    ORDER BY bat.created_at ASC`,
    { replacements: { wasteBagId }, type: QueryTypes.SELECT },
  );

  return results;
}
