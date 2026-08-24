// Generic chain-of-responsibility / pipeline infra for async, multi-step
// business validation — extracted out of core/material's validation so it's
// reusable by any module (entity, user, scm/order, ...) that needs the same
// shape: run N independent checks against one payload, collect every
// failure (not just the first), decide per-call which checks apply.
//
// Design choice worth flagging: this is deliberately NOT a generic
// "reusable node for any DB table" — a node here is just a function over a
// typed payload that pushes issues into a shared context. The actual
// DB/repository call a node makes is supplied by the CALLER (see nodes.ts's
// existsCheck/uniqueCheck factories) rather than baked into this file. That
// keeps this module framework/DB-agnostic and fully type-safe (no `keyof DB`
// generics or `any` casts needed here) — the cost is that "reuse" happens
// at the factory level (existsCheck, uniqueCheck, minMaxCheck), not by
// literally sharing one instantiated node across modules; each module still
// wires its own finder/checker functions into those factories.

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationContext<T> {
  data: T;
  issues: ValidationIssue[];
  /**
   * Per-invocation configuration a node can read — e.g. { excludeId: 5 }
   * to make a uniqueness check ignore the record being updated. Set by
   * whoever RUNS the chain for a specific use case (create vs. update vs.
   * import), not baked into the node itself — this is the "set context on
   * the validation steps" part of the ask: the same node (e.g. codeUnique)
   * behaves differently for create (no excludeId) vs. update (excludeId is
   * the record's own id) purely based on what's passed to runChain().
   */
  meta: Record<string, unknown>;
}

export type ValidatorNode<T> = (ctx: ValidationContext<T>) => Promise<void> | void;

/** Compose N nodes into one — runs sequentially, all nodes always run (no short-circuiting), issues accumulate. */
export function chain<T>(...nodes: ValidatorNode<T>[]): ValidatorNode<T> {
  return async (ctx) => {
    for (const node of nodes) {
      await node(ctx);
    }
  };
}

/** Run nodes concurrently instead of sequentially — safe whenever nodes don't depend on each other's results (most existence/uniqueness/min-max checks don't). */
export function parallelChain<T>(...nodes: ValidatorNode<T>[]): ValidatorNode<T> {
  return async (ctx) => {
    await Promise.all(nodes.map((node) => node(ctx)));
  };
}

/** Wrap a node so it only runs when the predicate holds — the chain's equivalent of the original's `if (data.material_subtype_id) { ... }` guards. */
export function when<T>(predicate: (data: T, meta: Record<string, unknown>) => boolean, node: ValidatorNode<T>): ValidatorNode<T> {
  return async (ctx) => {
    if (predicate(ctx.data, ctx.meta)) await node(ctx);
  };
}

/** Entry point: run a (possibly composed) node against a payload + context, return whatever issues it collected. */
export async function runChain<T>(node: ValidatorNode<T>, data: T, meta: Record<string, unknown> = {}): Promise<ValidationIssue[]> {
  const ctx: ValidationContext<T> = { data, issues: [], meta };
  await node(ctx);
  return ctx.issues;
}
