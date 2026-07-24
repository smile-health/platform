export function formatNum(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("id-ID")
}
