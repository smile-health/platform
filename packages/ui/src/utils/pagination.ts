export function getTotalPage(total: number, perPage: number): number {
  if (total === 0 || perPage === 0) return 1
  if (!total || !perPage) return 1
  return Math.ceil(total / perPage)
} 