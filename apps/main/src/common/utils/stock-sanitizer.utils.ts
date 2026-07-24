/**
 * Sanitizes stock update values to prevent negative values
 * for allocated_qty, unreceived_qty, and in_transit_qty columns
 */
export function sanitizeStockUpdateValues<T extends Record<string, unknown>>(
  data: T
): T {
  const sanitized = { ...data } as Record<string, unknown>

  // Sanitize allocated_qty
  if ("allocated_qty" in sanitized) {
    const value = sanitized.allocated_qty as number | null | undefined
    if (value !== null && value !== undefined && value < 0) {
      sanitized.allocated_qty = 0
    }
  }

  // Sanitize unreceived_qty
  if ("unreceived_qty" in sanitized) {
    const value = sanitized.unreceived_qty as number | null | undefined
    if (value !== null && value !== undefined && value < 0) {
      sanitized.unreceived_qty = 0
    }
  }

  // Sanitize in_transit_qty
  if ("in_transit_qty" in sanitized) {
    const value = sanitized.in_transit_qty as number | null | undefined
    if (value !== null && value !== undefined && value < 0) {
      sanitized.in_transit_qty = 0
    }
  }

  return sanitized as T
}
