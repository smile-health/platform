// Ported from apps/core/src/modules/program/program.repository.ts —
// "program" is really just filtered/scoped access to "workspaces" (see
// ../workspace/workspace.repository.ts for plain workspace CRUD), not a
// separate table.
//
// NOT ported (left as a follow-up):
//   - the `client`/integration_associations join (external system scoping)
//   - config JSON_EXTRACT filters (is_hierarchy_enabled/is_batch_enabled)
//   - superadmin-vs-scoped-user role check (USER_ROLE.SUPERADMIN)
// findUserPrograms below covers the core "which programs can this user see"
// case via user_workspaces, without the full original filter set.
import { db } from "../db";
import type { WorkspacesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type ProgramRow = Selectable<WorkspacesTable>;

export async function findAll(params: {
  keyword?: string;
  isBeneficiaries?: boolean;
  limit: number;
  page: number;
}): Promise<ProgramRow[]> {
  let query = db
    .selectFrom("workspaces")
    .selectAll()
    .where("deleted_at", "is", null);
  if (params.keyword) {
    query = query.where((eb) =>
      eb.or([eb("key", "like", `%${params.keyword}%`), eb("name", "like", `%${params.keyword}%`)]),
    );
  }
  if (params.isBeneficiaries !== undefined) {
    query = query.where("is_beneficiaries", "=", params.isBeneficiaries ? 1 : 0);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<ProgramRow[]>;
}

export async function findById(id: number): Promise<ProgramRow | undefined> {
  return db
    .selectFrom("workspaces")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<ProgramRow | undefined>;
}

// Used by core/entity's validation (existsAllCheck) to check program_ids in bulk.
export async function findExistingIds(ids: number[]): Promise<number[]> {
  if (!ids.length) return [];
  const rows = await db.selectFrom("workspaces").select("id").where("id", "in", ids).where("deleted_at", "is", null).execute();
  return rows.map((r) => r.id);
}

export async function findUserPrograms(userId: number): Promise<ProgramRow[]> {
  const memberships = await db
    .selectFrom("user_workspaces")
    .select("workspace_id")
    .where("user_id", "=", userId)
    .where("deleted_at", "is", null)
    .execute();
  if (!memberships.length) return [];
  return db
    .selectFrom("workspaces")
    .selectAll()
    .where(
      "id",
      "in",
      memberships.map((m) => m.workspace_id),
    )
    .where("deleted_at", "is", null)
    .execute() as Promise<ProgramRow[]>;
}
