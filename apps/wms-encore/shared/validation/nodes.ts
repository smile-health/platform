// Reusable validator-node factories — the actual "reuse" unit in this
// pattern. Each factory takes a small caller-supplied function (a
// repository lookup, usually) and returns a chain node; the same factory
// gets reused across modules, only the injected function changes.
import type { ValidatorNode } from "./chain";

/** e.g. material_level_id must reference a real material_levels row. */
export function existsCheck<T>(opts: {
  getId: (data: T) => number | null | undefined;
  checkExists: (id: number) => Promise<boolean>;
  field: string;
  message?: string;
}): ValidatorNode<T> {
  return async (ctx) => {
    const id = opts.getId(ctx.data);
    if (id == null) return;
    if (!(await opts.checkExists(id))) {
      ctx.issues.push({ path: opts.field, message: opts.message ?? "validator.not_exist" });
    }
  };
}

/**
 * e.g. material.code must be unique. `excludeId` comes from the chain's
 * meta (see chain.ts) — this is the concrete case of "set context on the
 * validation step": the SAME node ignores the current record on update
 * (excludeId set) and doesn't on create (excludeId undefined), without the
 * node itself knowing whether it's being used for create or update.
 */
export function uniqueCheck<T>(opts: {
  getValue: (data: T) => string | null | undefined;
  findExisting: (value: string, excludeId?: number) => Promise<{ id: number } | undefined>;
  field: string;
  message?: string;
}): ValidatorNode<T> {
  return async (ctx) => {
    const value = opts.getValue(ctx.data);
    if (!value) return;
    const excludeId = ctx.meta.excludeId as number | undefined;
    const existing = await opts.findExisting(value, excludeId);
    if (existing) {
      ctx.issues.push({ path: opts.field, message: opts.message ?? "validator.exist" });
    }
  };
}

/**
 * e.g. entity.program_ids must all reference real workspaces — same idea as
 * existsCheck but for a whole array of ids at once (one query instead of N).
 */
export function existsAllCheck<T>(opts: {
  getIds: (data: T) => number[] | null | undefined;
  findExistingIds: (ids: number[]) => Promise<number[]>;
  field: string;
  message?: string;
}): ValidatorNode<T> {
  return async (ctx) => {
    const ids = opts.getIds(ctx.data);
    if (!ids || ids.length === 0) return;
    const existingIds = new Set(await opts.findExistingIds(ids));
    const missing = ids.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      ctx.issues.push({ path: opts.field, message: opts.message ?? `validator.not_exist: ${missing.join(", ")}` });
    }
  };
}

/** e.g. min_retail_price must not exceed max_retail_price. Synchronous — no DB call needed, but still composes into the same chain as the async nodes above. */
export function minMaxCheck<T>(opts: {
  getMin: (data: T) => number | null | undefined;
  getMax: (data: T) => number | null | undefined;
  minField: string;
  maxField: string;
}): ValidatorNode<T> {
  return (ctx) => {
    const min = opts.getMin(ctx.data);
    const max = opts.getMax(ctx.data);
    if (min == null || max == null) return;
    if (min > max) {
      ctx.issues.push({ path: opts.minField, message: `validator.not_greater_than: ${opts.minField}/${opts.maxField}` });
    }
  };
}
