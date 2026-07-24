export function substituteClickHouseParams(
  query: string,
  params: Record<string, unknown> | undefined,
  options?: {
    timezone?: string
    allowUndefined?: boolean
  }
): string {
  const timezone = options?.timezone ?? "Asia/Jakarta"
  const allowUndefined = options?.allowUndefined ?? false

  query = query.replace(/^\s*[\r\n]/gm, "") // remove lines that contains only white space

  return query.replace(
    /\{(\w+):([A-Za-z][A-Za-z0-9]*)(?:\(([^}]*)\))?\}/g,
    (_, key, type, typeArgs) => {
      const value = params?.[key]

      if (value === undefined || value === null) {
        if (allowUndefined) return "NULL"
        throw new Error(`Missing query param: ${key}`)
      }

      switch (type) {
        case "Int":
        case "Int8":
        case "Int16":
        case "Int32":
        case "Int64":
        case "UInt8":
        case "UInt16":
        case "UInt32":
        case "UInt64":
        case "Float":
        case "Float32":
        case "Float64":
          if (typeof value !== "number") {
            throw new Error(`Param ${key} must be a number`)
          }
          return String(value)

        case "String":
          return `'${escapeSqlString(String(value))}'`

        case "DateTime":
          if (typeof value !== "string") {
            throw new Error(`Param ${key} must be a datetime string`)
          }
          return `toDateTime('${escapeSqlString(value)}', '${timezone}')`

        case "Array": {
          if (!Array.isArray(value)) {
            throw new Error(`Param ${key} must be an array`)
          }

          const innerType = typeArgs?.trim()

          if (!innerType) {
            throw new Error(`Array type missing for param ${key}`)
          }

          if (value.length === 0) {
            return "(NULL)"
          }

          return `(${value
            .map((v) => formatArrayValue(v, innerType, timezone))
            .join(", ")})`
        }

        default:
          throw new Error(`Unsupported type: ${type}`)
      }
    }
  )
}

function escapeSqlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

function formatArrayValue(
  value: string | number,
  type: string,
  timezone: string
): string {
  switch (type) {
    case "Int":
    case "Int8":
    case "Int16":
    case "Int32":
    case "Int64":
    case "UInt8":
    case "UInt16":
    case "UInt32":
    case "UInt64":
    case "Float":
    case "Float32":
    case "Float64":
      if (typeof value !== "number") {
        throw new Error(`Array value must be number for type ${type}`)
      }
      return String(value)

    case "String":
      return `'${escapeSqlString(String(value))}'`

    case "DateTime":
      if (typeof value !== "string") {
        throw new Error(`Array DateTime value must be string`)
      }
      return `toDateTime('${escapeSqlString(value)}', '${timezone}')`

    default:
      throw new Error(`Unsupported Array type: ${type}`)
  }
}
