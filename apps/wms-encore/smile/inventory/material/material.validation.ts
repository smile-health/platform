// Ported from apps/core/src/modules/material/material.middleware.ts's
// attachCommonRefinements + #validateMaterialHierarchy — composed from
// shared/validation's chain-of-responsibility nodes instead of one long
// imperative function (see chain.ts's header for the design rationale).
// Public API (validateMaterialRequest) is unchanged, so material.service.ts
// didn't need to change for this.
//
// NOT ported: program_ids/is_hierarchy cross-check against a workspace's
// JSON-configured is_hierarchy_enabled flag (#isProgramValid in the
// original) — needs the workspaces.config JSON_EXTRACT logic wired up,
// left as a follow-up.
//
// Bulk import still validates one row at a time (N DB round-trips per
// check instead of 1) — a batched version was tried and reverted: it
// required parameterizing every node as a builder function so the same
// node could run against either a live repo call or a prefetched-Set
// checker, which added indirection to the single-record path (the common
// case) to serve the bulk path (the uncommon one), and only partially paid
// off since two of the nodes still hit the DB per row either way. Not worth
// it without evidence a real import is large enough for the N+1 cost to
// matter — flagged as a known limitation, not silently accepted.
import { db } from "../db";
import { MATERIAL_LEVEL, type MaterialRequest } from "./material.schema";
import * as materialRepo from "./material.repository";
import * as materialLevelRepo from "../material-level/material-level.repository";
import * as materialUnitRepo from "../material-unit/material-unit.repository";
import { chain, parallelChain, when, type ValidatorNode } from "../../../shared/validation/chain";
import { existsCheck, uniqueCheck, minMaxCheck } from "../../../shared/validation/nodes";
import { createValidator } from "../../../shared/validation/validator";

// --- Entry point + chain shape ------------------------------------------------
// Read this first: it's the whole "what does validating a material check"
// picture. Node bodies (the how) are below — drill into those only if this
// summary isn't enough. `getMaterialValidationChain` is a function
// declaration (hoisted), not a const, specifically so it can sit up here
// even though it references consts defined further down — those are only
// resolved when this function actually RUNS (at request time, well after
// the whole module has finished evaluating), not when it's declared.

// `createValidator` supplies the error class + issue-collection plumbing —
// see shared/validation/validator.ts. Call as validateMaterialRequest(data,
// { excludeId: materialId }) on update.
export const validateMaterialRequest = createValidator<MaterialRequest>("Material", getMaterialValidationChain);

// Independent existence/uniqueness/min-max checks run concurrently
// (parallelChain) since none of them depend on each other's results; the
// hierarchy/update-guard nodes run after, sequentially, since
// parentHierarchyValid and hierarchyConsistency both reason about the same
// fields and read more clearly in a fixed order.
function getMaterialValidationChain(): ValidatorNode<MaterialRequest> {
  return chain(
    parallelChain(
      codeUnique,
      hierarchyCodeUnique,
      levelExists,
      typeExists,
      consumptionUnitExists,
      distributionUnitExists,
      subtypeBelongsToType,
      priceMinMax,
      temperatureMinMax,
    ),
    parentHierarchyValid,
    hierarchyConsistency,
    restrictedFieldsOnActiveMaterial,
  );
}

// --- Reusable node instances -------------------------------------------------
// These are the directly reusable units: existsCheck/uniqueCheck/minMaxCheck
// are shared factories (shared/validation/nodes.ts), instantiated here with
// material-specific finder functions. Another module (e.g. core/entity)
// would call the SAME factories with its own finders, not copy this logic.

const codeUnique = uniqueCheck<MaterialRequest>({
  getValue: (d) => d.code,
  findExisting: materialRepo.findByCode,
  field: "code",
});

const hierarchyCodeUnique = when<MaterialRequest>(
  (d) => !!d.hierarchy_code,
  uniqueCheck<MaterialRequest>({
    getValue: (d) => d.hierarchy_code,
    findExisting: materialRepo.findByHierarchyCode,
    field: "hierarchy_code",
  }),
);

const levelExists = existsCheck<MaterialRequest>({
  getId: (d) => d.material_level_id,
  checkExists: async (id) => !!(await materialLevelRepo.findById(id)),
  field: "material_level_id",
});

const typeExists = existsCheck<MaterialRequest>({
  getId: (d) => d.material_type_id,
  checkExists: async (id) => !!(await db.selectFrom("material_types").select("id").where("id", "=", id).executeTakeFirst()),
  field: "material_type_id",
});

const consumptionUnitExists = existsCheck<MaterialRequest>({
  getId: (d) => d.unit_of_consumption_id,
  checkExists: async (id) => !!(await materialUnitRepo.findById(id)),
  field: "unit_of_consumption_id",
});

const distributionUnitExists = existsCheck<MaterialRequest>({
  getId: (d) => d.unit_of_distribution_id,
  checkExists: async (id) => !!(await materialUnitRepo.findById(id)),
  field: "unit_of_distribution_id",
});

const priceMinMax = minMaxCheck<MaterialRequest>({
  getMin: (d) => d.min_retail_price,
  getMax: (d) => d.max_retail_price,
  minField: "min_retail_price",
  maxField: "max_retail_price",
});

const temperatureMinMax = minMaxCheck<MaterialRequest>({
  getMin: (d) => d.min_temperature,
  getMax: (d) => d.max_temperature,
  minField: "min_temperature",
  maxField: "max_temperature",
});

// --- Nodes that don't decompose into the generic factories -------------------
// Honest limitation of this pattern: not everything reduces to
// exists/unique/min-max. Subtype-belongs-to-type, parent hierarchy level
// ordering, the full hierarchy-consistency rule set, and the
// in-transaction/in-stock-opname update guards each read multiple fields
// together and don't factor into small reusable units the way the checks
// above do — they're still individual chain nodes (so they compose and are
// independently testable), just not reusable ACROSS modules the way
// existsCheck/uniqueCheck/minMaxCheck are.

const subtypeBelongsToType: ValidatorNode<MaterialRequest> = when(
  (d) => !!d.material_subtype_id,
  async (ctx) => {
    const subtype = await db
      .selectFrom("material_subtypes")
      .select(["id", "material_type_id"])
      .where("id", "=", ctx.data.material_subtype_id!)
      .executeTakeFirst();
    if (!subtype) {
      ctx.issues.push({ path: "material_subtype_id", message: "validator.not_exist" });
    } else if (subtype.material_type_id !== ctx.data.material_type_id) {
      ctx.issues.push({ path: "material_subtype_id", message: "validator.material_subtype_not_related" });
    }
  },
);

const parentHierarchyValid: ValidatorNode<MaterialRequest> = when(
  (d) => !!d.material_parent_ids?.length,
  async (ctx) => {
    const { material_parent_ids, material_level_id } = ctx.data;
    const parents = await materialRepo.findByIds(material_parent_ids!);
    const foundIds = new Set(parents.map((p) => p.id));
    for (const parentId of material_parent_ids!) {
      if (!foundIds.has(parentId)) {
        ctx.issues.push({ path: "material_parent_ids", message: `validator.not_exist: parent material id ${parentId}` });
      }
    }
    const levels = await db.selectFrom("material_levels").selectAll().execute();
    const targetLevel = levels.find((l) => l.id === material_level_id);
    for (const parent of parents) {
      const parentLevel = levels.find((l) => l.id === parent.material_level_id);
      if (parentLevel && targetLevel && Number(parentLevel.order) >= Number(targetLevel.order)) {
        ctx.issues.push({ path: "material_parent_ids", message: `validator.invalid_material_parent: ${parent.id}` });
      }
    }
  },
);

const hierarchyConsistency: ValidatorNode<MaterialRequest> = (ctx) => {
  const { is_hierarchy, hierarchy_code, material_parent_ids, material_level_id } = ctx.data;
  const push = (path: string, message: string) => ctx.issues.push({ path, message });

  if (!is_hierarchy && material_level_id !== MATERIAL_LEVEL.VARIANT) {
    push("material_level_id", "validator.non_hierarchy_material_level");
  }
  if (!is_hierarchy && hierarchy_code) {
    push("hierarchy_code", "validator.non_hierarchy_material_cannot_set_field: hierarchy_code");
  }
  if (!is_hierarchy && material_parent_ids) {
    push("material_parent_ids", "validator.non_hierarchy_material_cannot_set_field: material_parent_ids");
  }
  if (is_hierarchy && material_level_id !== MATERIAL_LEVEL.TEMPLATE && material_level_id !== MATERIAL_LEVEL.VARIANT) {
    push("material_level_id", "validator.hierarchy_material_level");
  }
  if (is_hierarchy && !hierarchy_code) {
    push("hierarchy_code", "validator.hierarchy_material_need_to_set_field: hierarchy_code");
  }
  if (is_hierarchy && material_level_id === MATERIAL_LEVEL.VARIANT && (!material_parent_ids || material_parent_ids.length === 0)) {
    push("material_parent_ids", "validator.hierarchy_material_need_to_set_field: material_parent_ids");
  }
  if (is_hierarchy && material_level_id === MATERIAL_LEVEL.TEMPLATE && material_parent_ids && material_parent_ids.length > 0) {
    push("material_parent_ids", "validator.non_hierarchy_material_cannot_set_field: material_parent_ids");
  }
};

// Update-only guard — reads `meta.excludeId` (set by the caller when
// updating) the same way uniqueCheck does, so it's a no-op on create
// without needing a separate "is this a create or update" flag.
const restrictedFieldsOnActiveMaterial: ValidatorNode<MaterialRequest> = when(
  (_d, meta) => meta.excludeId != null,
  async (ctx) => {
    const materialId = ctx.meta.excludeId as number;

    const inTransaction = await materialRepo.findInTransaction(materialId);
    if (inTransaction) {
      const restricted: Array<keyof typeof inTransaction> = [
        "consumption_unit_per_distribution_unit",
        "is_managed_in_batch",
        "is_temperature_sensitive",
      ];
      for (const field of restricted) {
        if (inTransaction[field] !== ctx.data[field]) {
          ctx.issues.push({ path: field, message: "validator.update_has_transaction" });
        }
      }
    }

    const inStockOpname = await materialRepo.findInStockOpname(materialId);
    if (inStockOpname && inStockOpname.is_stock_opname_mandatory !== ctx.data.is_stock_opname_mandatory) {
      ctx.issues.push({ path: "is_stock_opname_mandatory", message: "validator.update_has_stock_opname" });
    }
  },
);
