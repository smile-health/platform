export function getFirstErrorMessage(
  errors: Record<string, string[]>
): string | null {
  const firstKey = Object.keys(errors)[0]

  if (!firstKey) return null
  if (!errors?.[firstKey]?.[0]) return null

  return typeof errors[firstKey][0] === 'string' ? errors[firstKey][0] : null
}
