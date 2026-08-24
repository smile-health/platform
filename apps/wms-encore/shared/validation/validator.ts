// Collapses the 3-piece boilerplate every module was repeating (a
// `<Module>ValidationError` subclass, a `validate<Module>Request` wrapper,
// a `get<Module>ValidationChain` builder) into one call. The per-module
// Error subclasses added nothing — every controller did the same
// `instanceof` check and the same `.issues.map(...)` formatting — so this
// is ONE shared error type instead of one per module.
import { runChain, type ValidatorNode, type ValidationIssue } from "./chain";

export class ValidationError extends Error {
  constructor(
    public readonly subject: string,
    public readonly issues: ValidationIssue[],
  ) {
    super(`${subject} validation failed: ${issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`);
  }
}

/**
 * `subject` is just for the error message ("Material"/"Entity" validation
 * failed) — controllers only ever need to check `instanceof ValidationError`
 * generically, not per-module subclasses.
 *
 * `buildChain` is a thunk (not the chain itself) so modules can keep their
 * existing "entry point + chain shape at the top of the file" ordering —
 * calling a function is fine to do before its declaration; referencing a
 * const isn't (see material.validation.ts's original comment on this).
 */
export function createValidator<T>(subject: string, buildChain: () => ValidatorNode<T>) {
  return async function validate(data: T, meta: Record<string, unknown> = {}): Promise<void> {
    const issues = await runChain(buildChain(), data, meta);
    if (issues.length > 0) throw new ValidationError(subject, issues);
  };
}
