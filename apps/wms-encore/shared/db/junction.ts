// Extracted because it's genuinely duplicated, not because it might be
// useful someday: material.repository.ts's setPrograms and
// entity.repository.ts's setPrograms are the identical
// delete-all-then-insert-if-nonempty sequence against two different
// junction tables (material_workspaces / entity_workspaces). Same bar the
// validation factories had to clear — two real call sites, not a
// speculative one.
//
// Deliberately NOT generic over Kysely table names — that route needs
// `keyof DB`/`any` casts to stay generic (same trap the earlier bulk-import
// attempt hit). Each repo still writes its own type-safe Kysely query;
// this only factors out the CONTROL FLOW (delete, then insert-if-any),
// which is the part that was actually duplicated.
export async function syncJunction(
  ownerId: number,
  relatedIds: number[],
  ops: {
    deleteAllForOwner: (ownerId: number) => Promise<void>;
    insertMany: (ownerId: number, relatedIds: number[]) => Promise<void>;
  },
): Promise<void> {
  await ops.deleteAllForOwner(ownerId);
  if (relatedIds.length === 0) return;
  await ops.insertMany(ownerId, relatedIds);
}
