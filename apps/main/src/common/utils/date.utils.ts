export const toMysqlDatetime = (
  val: string | undefined
): string | undefined => {
  if (!val) return undefined
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toISOString().replace("T", " ").replace("Z", "").split(".")[0]
}
