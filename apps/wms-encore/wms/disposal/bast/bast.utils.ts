// Mirrors shared/utils/parseBoolean.ts (used by the original
// getAllDisposalController for the `isRead` query param).
const TRUE_SET = new Set(["1", "true", "yes", "y", "on"]);
const FALSE_SET = new Set(["0", "false", "no", "n", "off"]);

export function parseBoolean(input?: string): boolean | undefined {
  if (input == null) return undefined;
  const s = input.trim().toLowerCase();
  if (TRUE_SET.has(s)) return true;
  if (FALSE_SET.has(s)) return false;
  return undefined;
}
