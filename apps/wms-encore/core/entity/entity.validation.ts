// Ported from apps/core/src/modules/entity/entity.middleware.ts's create()
// superRefine chain + checkEntityRelation. Same structure as
// core/material/material.validation.ts: entry point + chain shape first,
// node definitions below.
//
// NOT ported: the import-specific bulk validation (#importCollectSets +
// per-row batch existence checks) — entity.service.ts's import path
// reuses this same per-row validateEntityRequest instead of a separate
// bulk-optimized path (see the discussion of what that costs vs. the
// original's N-in-one-query approach).
import * as entityRepo from "./entity.repository";
import * as entityTagRepo from "../entity-tag/entity-tag.repository";
import * as entityTypeRepo from "../entity-type/entity-type.repository";
import * as programRepo from "../program/program.repository";
import { chain, parallelChain, when, type ValidatorNode } from "../../shared/validation/chain";
import { existsCheck, uniqueCheck, existsAllCheck } from "../../shared/validation/nodes";
import { createValidator } from "../../shared/validation/validator";
import type { EntityRequest } from "./entity.schema";

// Call as validateEntityRequest(data, { excludeId: entityId }) on update.
export const validateEntityRequest = createValidator<EntityRequest>("Entity", getEntityValidationChain);

function getEntityValidationChain(): ValidatorNode<EntityRequest> {
  return chain(
    parallelChain(codeUnique, entityTagExists, typeExists, programsExist),
    entityRelationGuard,
  );
}

// --- Reusable node instances -------------------------------------------------
// All 4 of these reuse the SAME factories core/material's validation
// introduced (shared/validation/nodes.ts) — zero new validation
// infrastructure was needed for entity's create/update checks, only new
// finder functions wired in. This is the concrete reuse case the pattern
// was built for.

const codeUnique = uniqueCheck<EntityRequest>({
  getValue: (d) => d.code,
  findExisting: entityRepo.findByCode,
  field: "code",
});

const entityTagExists = existsCheck<EntityRequest>({
  getId: (d) => d.entity_tag_id,
  checkExists: async (id) => !!(await entityTagRepo.findById(id)),
  field: "entity_tag_id",
});

const typeExists = existsCheck<EntityRequest>({
  getId: (d) => d.type,
  checkExists: async (id) => !!(await entityTypeRepo.findById(id)),
  field: "type",
});

const programsExist = existsAllCheck<EntityRequest>({
  getIds: (d) => d.program_ids,
  findExistingIds: programRepo.findExistingIds,
  field: "program_ids",
});

// --- Node that doesn't decompose into the generic factories -----------------
// checkEntityRelation in the original: skip entirely on create (no entity
// to compare against); on update, only runs when `type` is actually
// changing, and needs the CURRENT entity row to compare against — reads
// meta.excludeId the same way material's restrictedFieldsOnActiveMaterial
// does, but the "only if type changed" condition needs a DB read to
// evaluate (the current type), not just a plain field comparison, so it
// isn't expressible as a single `when()` predicate the way the others are.
const entityRelationGuard: ValidatorNode<EntityRequest> = async (ctx) => {
  const entityId = ctx.meta.excludeId as number | undefined;
  if (!entityId) return; // create — nothing to compare against yet.

  const existing = await entityRepo.findById(entityId);
  if (!existing || existing.type === ctx.data.type) return; // no type change — original skips the check entirely.

  if (await entityRepo.isInCustomerVendorRelation(entityId)) {
    ctx.issues.push({ path: "type", message: "validator.entity_has_relation" });
  }
};
